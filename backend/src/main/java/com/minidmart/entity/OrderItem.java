package com.minidmart.entity;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    private String id;
    private Product product;
    private String productName;
    private String productUnit;
    private String productImageUrl;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal totalPrice;

    @Builder.Default
    private boolean returned = false;
}
