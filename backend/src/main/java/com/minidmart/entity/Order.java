package com.minidmart.entity;

import com.minidmart.enums.OrderStatus;
import com.minidmart.enums.OrderType;
import com.minidmart.enums.PaymentMethod;
import com.minidmart.enums.PaymentStatus;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    private String id;

    @Indexed(unique = true)
    private String orderNumber;

    private User user;

    private BigDecimal subtotal;

    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal deliveryFee = BigDecimal.ZERO;

    private BigDecimal totalAmount;

    private OrderType orderType;

    private LocalDate scheduledDate;

    private String scheduledTimeSlot;

    private String deliveryAddress;

    private String contactPhone;

    private OrderStatus status;

    private PaymentMethod paymentMethod;

    private PaymentStatus paymentStatus;

    private String cancelReason;

    private LocalDateTime deliveredAt;

    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
