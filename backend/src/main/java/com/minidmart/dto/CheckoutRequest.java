package com.minidmart.dto;

import com.minidmart.enums.OrderType;
import com.minidmart.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {

    @NotNull(message = "Order type is required")
    private OrderType orderType;

    private LocalDate scheduledDate;

    private String scheduledTimeSlot;

    private String deliveryAddress;

    private String contactPhone;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
}
