package com.minidmart;

import com.minidmart.dto.CreateReturnRequest;
import com.minidmart.dto.ProcessReturnRequest;
import com.minidmart.dto.ReturnExchangeRequestDto;
import com.minidmart.entity.*;
import com.minidmart.enums.*;
import com.minidmart.exception.BadRequestException;
import com.minidmart.exception.ForbiddenException;
import com.minidmart.repository.*;
import com.minidmart.security.UserPrincipal;
import com.minidmart.service.AuditLogService;
import com.minidmart.service.ReturnExchangeService;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReturnExchangeServiceTest {

    @Mock
    private ReturnExchangeRequestRepository returnRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private ReturnExchangeService returnExchangeService;

    private User user;
    private Order order;
    private OrderItem orderItem;
    private Product product;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(returnExchangeService, "returnEligibilityDays", 7);

        user = User.builder().id(1L).email("jane@example.com").role(Role.CUSTOMER).build();
        product = Product.builder().id(10L).name("Butter").stockQuantity(10).price(BigDecimal.valueOf(100)).active(true).build();
        order = Order.builder()
                .id(200L)
                .orderNumber("ORD-2026-DELIV")
                .user(user)
                .status(OrderStatus.DELIVERED)
                .deliveredAt(LocalDateTime.now().minusDays(3))
                .build();

        orderItem = OrderItem.builder()
                .id(300L)
                .order(order)
                .product(product)
                .productName("Butter")
                .quantity(1)
                .unitPrice(BigDecimal.valueOf(100))
                .totalPrice(BigDecimal.valueOf(100))
                .returned(false)
                .build();
        order.setItems(List.of(orderItem));

        UserPrincipal principal = UserPrincipal.create(user);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void testCreateReturnRequest_Success() {
        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(user));
        when(orderRepository.findById(200L)).thenReturn(Optional.of(order));
        when(orderItemRepository.findById(300L)).thenReturn(Optional.of(orderItem));
        when(returnRepository.existsByOrderItem_Id(300L)).thenReturn(false);
        when(returnRepository.save(any(ReturnExchangeRequest.class))).thenAnswer(i -> {
            ReturnExchangeRequest r = i.getArgument(0);
            r.setId(5000L);
            return r;
        });

        CreateReturnRequest req = CreateReturnRequest.builder()
                .orderId(200L)
                .orderItemId(300L)
                .requestType(RequestType.RETURN)
                .reason(ReturnReason.QUALITY_ISSUE)
                .reasonDetails("Package seal was broken")
                .build();

        ReturnExchangeRequestDto dto = returnExchangeService.createRequest(req, "127.0.0.1");

        assertNotNull(dto);
        assertEquals(ReturnStatus.REQUESTED, dto.getStatus());
        assertEquals(RequestType.RETURN, dto.getRequestType());
    }

    @Test
    void testCreateReturnRequest_ExpiredReturnWindow_ThrowsBadRequest() {
        // Delivered 10 days ago (limit is 7)
        order.setDeliveredAt(LocalDateTime.now().minusDays(10));

        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(user));
        when(orderRepository.findById(200L)).thenReturn(Optional.of(order));

        CreateReturnRequest req = CreateReturnRequest.builder()
                .orderId(200L)
                .orderItemId(300L)
                .requestType(RequestType.RETURN)
                .reason(ReturnReason.QUALITY_ISSUE)
                .build();

        assertThrows(BadRequestException.class, () -> returnExchangeService.createRequest(req, "127.0.0.1"));
    }

    @Test
    void testProcessReturn_CompleteAndRestock() {
        ReturnExchangeRequest returnReq = ReturnExchangeRequest.builder()
                .id(5000L)
                .requestNumber("RET-2026-TEST")
                .order(order)
                .orderItem(orderItem)
                .user(user)
                .requestType(RequestType.RETURN)
                .reason(ReturnReason.WRONG_PRODUCT) // Restockable
                .status(ReturnStatus.APPROVED)
                .build();

        when(returnRepository.findById(5000L)).thenReturn(Optional.of(returnReq));
        when(returnRepository.save(any(ReturnExchangeRequest.class))).thenAnswer(i -> i.getArgument(0));

        int initialStock = product.getStockQuantity(); // 10

        ProcessReturnRequest processReq = ProcessReturnRequest.builder()
                .status(ReturnStatus.COMPLETED)
                .restockInventory(true)
                .adminNotes("Verified and restocked")
                .build();

        ReturnExchangeRequestDto processed = returnExchangeService.processRequest(5000L, processReq, "127.0.0.1");

        assertEquals(ReturnStatus.COMPLETED, processed.getStatus());
        assertTrue(orderItem.isReturned());
        assertEquals(initialStock + 1, product.getStockQuantity()); // Restocked from 10 to 11
    }
}
