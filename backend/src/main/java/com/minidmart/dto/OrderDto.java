package com.minidmart.dto;

import com.minidmart.enums.OrderStatus;
import com.minidmart.enums.OrderType;
import com.minidmart.enums.PaymentMethod;
import com.minidmart.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private Long id;
    private String orderNumber;
    private Long userId;
    private String userName;
    private String userEmail;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal deliveryFee;
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
    private List<OrderItemDto> items = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Computed UI & Business Logic flags
    private boolean canCancel;
    private boolean returnEligible;
    private Integer returnEligibilityDaysLeft;
}
