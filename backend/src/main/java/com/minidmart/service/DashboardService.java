package com.minidmart.service;

import com.minidmart.dto.*;
import com.minidmart.entity.Order;
import com.minidmart.entity.OrderItem;
import com.minidmart.entity.Product;
import com.minidmart.entity.User;
import com.minidmart.enums.OrderStatus;
import com.minidmart.enums.ReturnStatus;
import com.minidmart.exception.ResourceNotFoundException;
import com.minidmart.repository.OrderRepository;
import com.minidmart.repository.ProductRepository;
import com.minidmart.repository.ReturnExchangeRequestRepository;
import com.minidmart.repository.UserRepository;
import com.minidmart.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ReturnExchangeRequestRepository returnRepository;
    private final OrderService orderService;
    private final ProductService productService;
    private final AuditLogService auditLogService;
    private final ReturnExchangeService returnExchangeService;

    public CustomerDashboardDto getCustomerDashboard() {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LocalTime now = LocalTime.now();
        String greeting;
        if (now.isBefore(LocalTime.NOON)) {
            greeting = "Good morning";
        } else if (now.isBefore(LocalTime.of(17, 0))) {
            greeting = "Good afternoon";
        } else {
            greeting = "Good evening";
        }

        List<Order> customerOrders = orderRepository.findByUser_EmailOrderByCreatedAtDesc(email);

        // Find active order (in-flight)
        OrderDto activeOrder = customerOrders.stream()
                .filter(o -> o.getStatus() != OrderStatus.DELIVERED
                        && o.getStatus() != OrderStatus.PICKED_UP
                        && o.getStatus() != OrderStatus.COMPLETED
                        && o.getStatus() != OrderStatus.CANCELLED)
                .findFirst()
                .map(orderService::mapToDto)
                .orElse(null);

        // Recent orders (up to 5)
        List<OrderDto> recentOrders = customerOrders.stream()
                .limit(5)
                .map(orderService::mapToDto)
                .collect(Collectors.toList());

        // Spending and savings totals
        BigDecimal totalSpent = BigDecimal.ZERO;
        BigDecimal totalSavings = BigDecimal.ZERO;
        Map<String, Integer> categoryCounts = new HashMap<>();
        Map<String, Product> orderedProducts = new LinkedHashMap<>();

        for (Order o : customerOrders) {
            if (o.getStatus() != OrderStatus.CANCELLED) {
                if (o.getTotalAmount() != null) {
                    totalSpent = totalSpent.add(o.getTotalAmount());
                }
                if (o.getDiscount() != null) {
                    totalSavings = totalSavings.add(o.getDiscount());
                }
                if (o.getItems() != null) {
                    for (OrderItem item : o.getItems()) {
                        if (item.getProduct() != null && item.getProduct().getId() != null) {
                            orderedProducts.putIfAbsent(item.getProduct().getId(), item.getProduct());
                            if (item.getProduct().getCategory() != null) {
                                String catName = item.getProduct().getCategory().getName();
                                categoryCounts.put(catName, categoryCounts.getOrDefault(catName, 0) + (item.getQuantity() != null ? item.getQuantity() : 1));
                            }
                        }
                    }
                }
            }
        }

        // Buy again products (up to 8)
        List<ProductDto> buyAgainProducts = orderedProducts.values().stream()
                .limit(8)
                .map(productService::mapToDto)
                .collect(Collectors.toList());

        String favoriteCategory = categoryCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Groceries");

        return CustomerDashboardDto.builder()
                .greeting(greeting)
                .customerName(user.getName())
                .activeOrder(activeOrder)
                .recentOrders(recentOrders)
                .totalOrdersCount(customerOrders.size())
                .totalSpent(totalSpent)
                .totalSavings(totalSavings)
                .buyAgainProducts(buyAgainProducts)
                .favoriteCategoryName(favoriteCategory)
                .build();
    }

    public StaffDashboardDto getStaffDashboard() {
        long newOrders = orderRepository.countByStatus(OrderStatus.PLACED);
        long preparing = orderRepository.countByStatus(OrderStatus.PREPARING);
        long readyForPickup = orderRepository.countByStatus(OrderStatus.READY_FOR_PICKUP);
        long outForDelivery = orderRepository.countByStatus(OrderStatus.OUT_FOR_DELIVERY);
        long pendingReturns = returnRepository.countByStatus(ReturnStatus.REQUESTED);
        long lowStock = productRepository.countLowStockProducts();
        long outOfStock = productRepository.countByActiveTrueAndStockQuantityEquals(0);

        // Urgent orders: PLACED and PREPARING
        List<OrderDto> urgentOrders = orderRepository.findByStatusOrderByCreatedAtDesc(OrderStatus.PLACED).stream()
                .limit(10)
                .map(orderService::mapToDto)
                .collect(Collectors.toList());

        List<ProductDto> lowStockProducts = productService.getLowStockProducts().stream()
                .limit(10)
                .collect(Collectors.toList());

        return StaffDashboardDto.builder()
                .newOrdersCount(newOrders)
                .preparingCount(preparing)
                .readyForPickupCount(readyForPickup)
                .outForDeliveryCount(outForDelivery)
                .pendingReturnsCount(pendingReturns)
                .lowStockCount(lowStock)
                .outOfStockCount(outOfStock)
                .urgentOrders(urgentOrders)
                .lowStockProducts(lowStockProducts)
                .build();
    }

    public ManagerAdminDashboardDto getManagerAdminDashboard() {
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        long todayOrders = orderRepository.countByCreatedAtGreaterThanEqual(startOfToday);

        // Revenue calculations
        List<Order> allNonCancelledOrders = orderRepository.findByStatusNot(OrderStatus.CANCELLED);
        BigDecimal totalRevenue = allNonCancelledOrders.stream()
                .map(o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal todayRevenue = allNonCancelledOrders.stream()
                .filter(o -> o.getCreatedAt() != null && !o.getCreatedAt().isBefore(startOfToday))
                .map(o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pendingOrders = orderRepository.countByStatus(OrderStatus.PLACED)
                + orderRepository.countByStatus(OrderStatus.CONFIRMED)
                + orderRepository.countByStatus(OrderStatus.PREPARING);

        long lowStock = productRepository.countLowStockProducts();
        long pendingReturns = returnRepository.countByStatus(ReturnStatus.REQUESTED);

        List<OrderDto> recentOrders = orderRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(orderService::mapToDto)
                .collect(Collectors.toList());

        List<AuditLogDto> recentLogs = auditLogService.getRecentLogs(10);

        List<ReturnExchangeRequestDto> pendingReturnDtos = returnRepository.findByStatusOrderByCreatedAtDesc(ReturnStatus.REQUESTED).stream()
                .limit(10)
                .map(returnExchangeService::mapToDto)
                .collect(Collectors.toList());

        return ManagerAdminDashboardDto.builder()
                .totalUsersCount(totalUsers)
                .totalProductsCount(totalProducts)
                .totalOrdersCount(totalOrders)
                .todayOrdersCount(todayOrders)
                .totalRevenue(totalRevenue)
                .todayRevenue(todayRevenue)
                .pendingOrdersCount(pendingOrders)
                .lowStockCount(lowStock)
                .pendingReturnsCount(pendingReturns)
                .recentOrders(recentOrders)
                .recentAuditLogs(recentLogs)
                .pendingReturns(pendingReturnDtos)
                .build();
    }
}
