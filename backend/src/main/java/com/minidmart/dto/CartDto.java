package com.minidmart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartDto {
    private Long id;
    @Builder.Default
    private List<CartItemDto> items = new ArrayList<>();
    private Integer totalQuantity;
    private BigDecimal originalSubtotal;
    private BigDecimal subtotal;
    private BigDecimal totalSavings;
    private BigDecimal standardDeliveryFee;
    private BigDecimal deliveryFee;
    private BigDecimal freeDeliveryThreshold;
    private boolean freeDeliveryUnlocked;
    private BigDecimal amountNeededForFreeDelivery;
    private BigDecimal finalTotal;
}
