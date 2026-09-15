package com.minidmart.entity;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    private String id;
    private Product product;
    private Integer quantity;
    private BigDecimal unitPrice;
}
