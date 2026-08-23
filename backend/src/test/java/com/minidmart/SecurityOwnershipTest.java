package com.minidmart;

import com.minidmart.entity.Order;
import com.minidmart.entity.User;
import com.minidmart.enums.OrderStatus;
import com.minidmart.enums.Role;
import com.minidmart.exception.ForbiddenException;
import com.minidmart.repository.OrderRepository;
import com.minidmart.security.UserPrincipal;
import com.minidmart.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SecurityOwnershipTest {

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private OrderService orderService;

    private User customerA;
    private User customerB;
    private Order orderB;

    @BeforeEach
    void setUp() {
        customerA = User.builder().id(1L).email("victim@example.com").role(Role.CUSTOMER).build();
        customerB = User.builder().id(2L).email("attacker@example.com").role(Role.CUSTOMER).build();

        orderB = Order.builder()
                .id(999L)
                .orderNumber("ORD-PRIVATE-999")
                .user(customerA)
                .status(OrderStatus.PLACED)
                .subtotal(BigDecimal.valueOf(100))
                .totalAmount(BigDecimal.valueOf(100))
                .items(Collections.emptyList())
                .build();
    }

    @Test
    void testCustomerB_CannotAccess_CustomerA_Order() {
        // Authenticated as Customer B
        UserPrincipal principalB = UserPrincipal.create(customerB);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principalB, null, principalB.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        when(orderRepository.findById(999L)).thenReturn(Optional.of(orderB));

        // Customer B tries to view Customer A's order by ID
        assertThrows(ForbiddenException.class, () -> orderService.getOrderById(999L));
    }
}
