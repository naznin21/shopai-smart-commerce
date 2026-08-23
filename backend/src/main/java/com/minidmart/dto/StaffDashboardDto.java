package com.minidmart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffDashboardDto {
    private long newOrdersCount;
    private long preparingCount;
    private long readyForPickupCount;
    private long outForDeliveryCount;
    private long pendingReturnsCount;
    private long lowStockCount;
    private long outOfStockCount;
    @Builder.Default
    private List<OrderDto> urgentOrders = new ArrayList<>();
    @Builder.Default
    private List<ProductDto> lowStockProducts = new ArrayList<>();
}
