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
public class ManagerAdminDashboardDto {
    private long totalUsersCount;
    private long totalProductsCount;
    private long totalOrdersCount;
    private long todayOrdersCount;
    private BigDecimal totalRevenue;
    private BigDecimal todayRevenue;
    private long pendingOrdersCount;
    private long lowStockCount;
    private long pendingReturnsCount;
    @Builder.Default
    private List<OrderDto> recentOrders = new ArrayList<>();
    @Builder.Default
    private List<AuditLogDto> recentAuditLogs = new ArrayList<>();
    @Builder.Default
    private List<ReturnExchangeRequestDto> pendingReturns = new ArrayList<>();
}
