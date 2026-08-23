package com.minidmart;

import com.minidmart.dto.CancelOrderRequest;
import com.minidmart.dto.CheckoutRequest;
import com.minidmart.dto.OrderDto;
import com.minidmart.entity.*;
import com.minidmart.enums.*;
import com.minidmart.exception.BadRequestException;
import com.minidmart.exception.ForbiddenException;
import com.minidmart.repository.CartRepository;
import com.minidmart.repository.OrderRepository;
import com.minidmart.repository.ProductRepository;
import com.minidmart.repository.UserRepository;
import com.minidmart.security.UserPrincipal;
import com.minidmart.service.AuditLogService;
import com.minidmart.service.OrderService;
import com.minidmart.service.PickupSlotService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PickupSlotService pickupSlotService;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private OrderService orderService;

    private User user;
    private Product product;
    private Cart cart;
    private CartItem cartItem;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(orderService, "freeDeliveryThreshold", BigDecimal.valueOf(500.0));
        ReflectionTestUtils.setField(orderService, "standardDeliveryFee", BigDecimal.valueOf(40.0));
        ReflectionTestUtils.setField(orderService, "returnEligibilityDays", 7);

        user = User.builder()
                .id(1L)
                .name("John Doe")
                .email("john@example.com")
                .role(Role.CUSTOMER)
                .active(true)
                .build();

        Category category = Category.builder().id(1L).name("Dairy").build();

        product = Product.builder()
                .id(10L)
                .name("Organic Milk")
                .price(BigDecimal.valueOf(60.0))
                .discountPrice(BigDecimal.valueOf(50.0))
                .stockQuantity(15)
                .category(category)
                .active(true)
                .build();

        cart = Cart.builder().id(100L).user(user).items(new ArrayList<>()).build();

        cartItem = CartItem.builder()
                .id(500L)
                .cart(cart)
                .product(product)
                .quantity(2)
                .unitPrice(BigDecimal.valueOf(50.0))
                .build();
        cart.getItems().add(cartItem);

        UserPrincipal principal = UserPrincipal.create(user);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void testCheckout_Success_HomeDelivery() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser_Email("john@example.com")).thenReturn(Optional.of(cart));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(1000L);
            return o;
        });

        CheckoutRequest request = CheckoutRequest.builder()
                .orderType(OrderType.HOME_DELIVERY)
                .deliveryAddress("123 Baker Street")
                .contactPhone("+91 9999900000")
                .paymentMethod(PaymentMethod.CASH_ON_DELIVERY)
                .build();

        OrderDto orderDto = orderService.checkout(request, "127.0.0.1");

        assertNotNull(orderDto);
        assertEquals(OrderType.HOME_DELIVERY, orderDto.getOrderType());
        // Subtotal = 50 * 2 = 100. Delivery fee = 40 (subtotal < 500). Total = 140.
        assertEquals(0, BigDecimal.valueOf(100).compareTo(orderDto.getSubtotal()));
        assertEquals(0, BigDecimal.valueOf(40.0).compareTo(orderDto.getDeliveryFee()));
        assertEquals(0, BigDecimal.valueOf(140.0).compareTo(orderDto.getTotalAmount()));
        assertEquals(13, product.getStockQuantity()); // Stock was 15, deducted 2 -> 13
    }

    @Test
    void testCheckout_InsufficientStock_ThrowsBadRequest() {
        product.setStockQuantity(1); // Less than cart quantity (2)

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser_Email("john@example.com")).thenReturn(Optional.of(cart));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        CheckoutRequest request = CheckoutRequest.builder()
                .orderType(OrderType.HOME_DELIVERY)
                .deliveryAddress("123 Baker Street")
                .contactPhone("+91 9999900000")
                .paymentMethod(PaymentMethod.CASH_ON_DELIVERY)
                .build();

        assertThrows(BadRequestException.class, () -> orderService.checkout(request, "127.0.0.1"));
    }

    @Test
    void testCancelOrder_Success_RestoresStock() {
        Order order = Order.builder()
                .id(1000L)
                .orderNumber("ORD-2026-TEST")
                .user(user)
                .subtotal(BigDecimal.valueOf(100))
                .totalAmount(BigDecimal.valueOf(140))
                .status(OrderStatus.PLACED)
                .orderType(OrderType.HOME_DELIVERY)
                .items(List.of(OrderItem.builder()
                        .product(product)
                        .quantity(2)
                        .unitPrice(BigDecimal.valueOf(50))
                        .totalPrice(BigDecimal.valueOf(100))
                        .build()))
                .build();

        when(orderRepository.findById(1000L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        int initialStock = product.getStockQuantity(); // 15
        OrderDto cancelled = orderService.cancelOrder(1000L, new CancelOrderRequest("Changed my mind"), "127.0.0.1");

        assertEquals(OrderStatus.CANCELLED, cancelled.getStatus());
        assertEquals(initialStock + 2, product.getStockQuantity()); // 15 + 2 = 17
    }

    @Test
    void testCancelOrder_AfterPreparation_ThrowsBadRequest() {
        Order order = Order.builder()
                .id(1000L)
                .orderNumber("ORD-2026-TEST")
                .user(user)
                .status(OrderStatus.PREPARING)
                .orderType(OrderType.HOME_DELIVERY)
                .build();

        when(orderRepository.findById(1000L)).thenReturn(Optional.of(order));

        assertThrows(BadRequestException.class, () ->
                orderService.cancelOrder(1000L, new CancelOrderRequest("Too late"), "127.0.0.1"));
    }
}
