package com.minidmart.service;

import com.minidmart.dto.CancelOrderRequest;
import com.minidmart.dto.CheckoutRequest;
import com.minidmart.dto.OrderDto;
import com.minidmart.dto.OrderItemDto;
import com.minidmart.dto.UpdateOrderStatusRequest;
import com.minidmart.entity.*;
import com.minidmart.enums.*;
import com.minidmart.exception.BadRequestException;
import com.minidmart.exception.ForbiddenException;
import com.minidmart.exception.ResourceNotFoundException;
import com.minidmart.repository.CartRepository;
import com.minidmart.repository.OrderRepository;
import com.minidmart.repository.ProductRepository;
import com.minidmart.repository.UserRepository;
import com.minidmart.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PickupSlotService pickupSlotService;
    private final AuditLogService auditLogService;

    @Value("${app.delivery.free-threshold:500.0}")
    private BigDecimal freeDeliveryThreshold;

    @Value("${app.delivery.standard-fee:40.0}")
    private BigDecimal standardDeliveryFee;

    @Value("${app.returns.eligibility-days:7}")
    private int returnEligibilityDays;

    @Transactional
    public OrderDto checkout(CheckoutRequest request, String ipAddress) {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        Cart cart = cartRepository.findByUser_Email(email)
                .orElseThrow(() -> new BadRequestException("No cart found for user"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Your cart is empty. Please add products before checking out.");
        }

        // Validate Order Type specifics
        if (request.getOrderType() == OrderType.STORE_PICKUP) {
            if (request.getScheduledDate() == null || request.getScheduledTimeSlot() == null || request.getScheduledTimeSlot().trim().isEmpty()) {
                throw new BadRequestException("Pickup date and time slot are required for store pickup.");
            }
            if (request.getScheduledDate().isBefore(LocalDate.now())) {
                throw new BadRequestException("Pickup date cannot be in the past.");
            }
            // Reserve Pickup Slot (validates capacity)
            pickupSlotService.reserveSlot(request.getScheduledDate(), request.getScheduledTimeSlot().trim());
        } else if (request.getOrderType() == OrderType.HOME_DELIVERY) {
            if (request.getDeliveryAddress() == null || request.getDeliveryAddress().trim().isEmpty()) {
                throw new BadRequestException("Delivery address is required for home delivery.");
            }
            if (request.getContactPhone() == null || request.getContactPhone().trim().isEmpty()) {
                throw new BadRequestException("Contact phone number is required for home delivery.");
            }
        }

        // 1. Rigorous Stock Validation and Price Calculation
        BigDecimal originalSubtotal = BigDecimal.ZERO;
        BigDecimal discountedSubtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepository.findById(cartItem.getProduct().getId())
                    .orElseThrow(() -> new BadRequestException("Product no longer exists: " + cartItem.getProduct().getName()));

            if (!product.isActive()) {
                throw new BadRequestException("Product '" + product.getName() + "' is no longer available.");
            }

            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException(String.format(
                        "Stock changed! Only %d units of '%s' are currently available. Please adjust your cart.",
                        product.getStockQuantity(), product.getName()));
            }

            BigDecimal unitPrice = product.getEffectivePrice();
            BigDecimal originalPrice = product.getPrice();
            int qty = cartItem.getQuantity();

            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(qty));
            BigDecimal originalTotal = originalPrice.multiply(BigDecimal.valueOf(qty));

            discountedSubtotal = discountedSubtotal.add(itemTotal);
            originalSubtotal = originalSubtotal.add(originalTotal);

            // Deduct stock atomically
            product.setStockQuantity(product.getStockQuantity() - qty);
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .productName(product.getName())
                    .productUnit(product.getUnit())
                    .productImageUrl(product.getImageUrl())
                    .unitPrice(unitPrice)
                    .quantity(qty)
                    .totalPrice(itemTotal)
                    .returned(false)
                    .build();

            orderItems.add(orderItem);
        }

        BigDecimal discount = originalSubtotal.subtract(discountedSubtotal);
        if (discount.compareTo(BigDecimal.ZERO) < 0) {
            discount = BigDecimal.ZERO;
        }

        BigDecimal deliveryFee = BigDecimal.ZERO;
        if (request.getOrderType() == OrderType.HOME_DELIVERY) {
            if (discountedSubtotal.compareTo(freeDeliveryThreshold) < 0) {
                deliveryFee = standardDeliveryFee;
            }
        }

        BigDecimal finalTotal = discountedSubtotal.add(deliveryFee);

        PaymentStatus paymentStatus = (request.getPaymentMethod() == PaymentMethod.DEMO_ONLINE_PAYMENT)
                ? PaymentStatus.PAID
                : PaymentStatus.PENDING;

        String orderNumber = "ORD-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .subtotal(discountedSubtotal)
                .discount(discount)
                .deliveryFee(deliveryFee)
                .totalAmount(finalTotal)
                .orderType(request.getOrderType())
                .scheduledDate(request.getScheduledDate())
                .scheduledTimeSlot(request.getScheduledTimeSlot() != null ? request.getScheduledTimeSlot().trim() : null)
                .deliveryAddress(request.getDeliveryAddress() != null ? request.getDeliveryAddress().trim() : user.getAddress())
                .contactPhone(request.getContactPhone() != null ? request.getContactPhone().trim() : user.getPhone())
                .status(OrderStatus.PLACED)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(paymentStatus)
                .build();

        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        // Clear cart
        cart.getItems().clear();
        cartRepository.save(cart);

        auditLogService.log(
                user.getEmail(),
                AuditAction.ORDER_CREATE,
                "ORDER",
                String.valueOf(savedOrder.getId()),
                "Placed order " + savedOrder.getOrderNumber() + " total: ₹" + savedOrder.getTotalAmount(),
                ipAddress
        );

        return mapToDto(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        enforceOrderOwnershipOrStaff(order);
        return mapToDto(order);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));

        enforceOrderOwnershipOrStaff(order);
        return mapToDto(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getCustomerOrders() {
        String email = SecurityUtils.getCurrentUserEmail();
        return orderRepository.findByUser_EmailOrderByCreatedAtDesc(email).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getOrdersByType(OrderType orderType) {
        return orderRepository.findByOrderTypeOrderByCreatedAtDesc(orderType).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderDto cancelOrder(Long orderId, CancelOrderRequest request, String ipAddress) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        enforceOrderOwnershipOrStaff(order);

        if (order.getStatus() != OrderStatus.PLACED && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Order cannot be cancelled because it is already in '" + order.getStatus() + "' status.");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelReason(request.getReason().trim());

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }

        // Restore stock
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        // Release slot if store pickup
        if (order.getOrderType() == OrderType.STORE_PICKUP && order.getScheduledDate() != null && order.getScheduledTimeSlot() != null) {
            pickupSlotService.releaseSlot(order.getScheduledDate(), order.getScheduledTimeSlot());
        }

        Order saved = orderRepository.save(order);

        auditLogService.log(
                SecurityUtils.getCurrentUserEmail(),
                AuditAction.ORDER_CANCEL,
                "ORDER",
                String.valueOf(saved.getId()),
                "Cancelled order " + saved.getOrderNumber() + ". Reason: " + request.getReason(),
                ipAddress
        );

        return mapToDto(saved);
    }

    @Transactional
    public OrderDto updateOrderStatus(Long orderId, UpdateOrderStatusRequest request, String ipAddress) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        OrderStatus oldStatus = order.getStatus();
        OrderStatus newStatus = request.getStatus();

        if (oldStatus == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot modify a cancelled order.");
        }

        order.setStatus(newStatus);

        if (newStatus == OrderStatus.DELIVERED || newStatus == OrderStatus.PICKED_UP || newStatus == OrderStatus.COMPLETED) {
            if (order.getDeliveredAt() == null) {
                order.setDeliveredAt(LocalDateTime.now());
            }
            order.setPaymentStatus(PaymentStatus.PAID);
        }

        Order saved = orderRepository.save(order);

        auditLogService.log(
                SecurityUtils.getCurrentUserEmail(),
                AuditAction.ORDER_STATUS_CHANGE,
                "ORDER",
                String.valueOf(saved.getId()),
                String.format("Updated order %s status from %s to %s", saved.getOrderNumber(), oldStatus, newStatus),
                ipAddress
        );

        return mapToDto(saved);
    }

    private void enforceOrderOwnershipOrStaff(Order order) {
        if (SecurityUtils.isStaffOrAbove()) {
            return;
        }
        String currentEmail = SecurityUtils.getCurrentUserEmail();
        if (!order.getUser().getEmail().equalsIgnoreCase(currentEmail)) {
            throw new ForbiddenException("Access denied: You do not own this order.");
        }
    }

    public OrderDto mapToDto(Order order) {
        List<OrderItemDto> itemDtos = order.getItems().stream()
                .map(item -> OrderItemDto.builder()
                        .id(item.getId())
                        .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                        .productName(item.getProductName())
                        .productUnit(item.getProductUnit())
                        .productImageUrl(item.getProductImageUrl())
                        .unitPrice(item.getUnitPrice())
                        .quantity(item.getQuantity())
                        .totalPrice(item.getTotalPrice())
                        .returned(item.isReturned())
                        .build())
                .collect(Collectors.toList());

        boolean canCancel = (order.getStatus() == OrderStatus.PLACED || order.getStatus() == OrderStatus.CONFIRMED);

        boolean returnEligible = false;
        Integer returnEligibilityDaysLeft = null;

        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.PICKED_UP || order.getStatus() == OrderStatus.COMPLETED) {
            LocalDateTime deliveryTime = order.getDeliveredAt() != null ? order.getDeliveredAt() : order.getUpdatedAt();
            long daysSinceDelivery = ChronoUnit.DAYS.between(deliveryTime, LocalDateTime.now());
            if (daysSinceDelivery <= returnEligibilityDays) {
                returnEligible = true;
                returnEligibilityDaysLeft = Math.max(0, (int) (returnEligibilityDays - daysSinceDelivery));
            } else {
                returnEligibilityDaysLeft = 0;
            }
        }

        return OrderDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser().getId())
                .userName(order.getUser().getName())
                .userEmail(order.getUser().getEmail())
                .subtotal(order.getSubtotal())
                .discount(order.getDiscount())
                .deliveryFee(order.getDeliveryFee())
                .totalAmount(order.getTotalAmount())
                .orderType(order.getOrderType())
                .scheduledDate(order.getScheduledDate())
                .scheduledTimeSlot(order.getScheduledTimeSlot())
                .deliveryAddress(order.getDeliveryAddress())
                .contactPhone(order.getContactPhone())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .cancelReason(order.getCancelReason())
                .deliveredAt(order.getDeliveredAt())
                .items(itemDtos)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .canCancel(canCancel)
                .returnEligible(returnEligible)
                .returnEligibilityDaysLeft(returnEligibilityDaysLeft)
                .build();
    }
}
