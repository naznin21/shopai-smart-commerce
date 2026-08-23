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
public class CustomerDashboardDto {
    private String greeting;
    private String customerName;
    private OrderDto activeOrder;
    @Builder.Default
    private List<OrderDto> recentOrders = new ArrayList<>();
    private int totalOrdersCount;
    private BigDecimal totalSpent;
    private BigDecimal totalSavings;
    @Builder.Default
    private List<ProductDto> buyAgainProducts = new ArrayList<>();
    private String favoriteCategoryName;
}
