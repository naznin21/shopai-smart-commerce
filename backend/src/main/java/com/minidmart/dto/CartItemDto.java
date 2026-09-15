package com.minidmart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDto {
    private String id;
    private String productId;
    private String productName;
    private String productUnit;
    private String productImageUrl;
    private BigDecimal unitPrice;
    private BigDecimal originalPrice;
    private Integer quantity;
    private Integer availableStock;
    private BigDecimal itemTotal;
    private boolean isAvailable;
}
