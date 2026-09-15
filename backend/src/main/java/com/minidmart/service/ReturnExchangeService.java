package com.minidmart.service;

import com.minidmart.dto.CreateReturnRequest;
import com.minidmart.dto.ProcessReturnRequest;
import com.minidmart.dto.ReturnExchangeRequestDto;
import com.minidmart.entity.*;
import com.minidmart.enums.*;
import com.minidmart.exception.BadRequestException;
import com.minidmart.exception.ForbiddenException;
import com.minidmart.exception.ResourceNotFoundException;
import com.minidmart.repository.*;
import com.minidmart.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReturnExchangeService {

    private final ReturnExchangeRequestRepository returnRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Value("${app.returns.eligibility-days:7}")
    private int returnEligibilityDays;

    public ReturnExchangeRequestDto createRequest(CreateReturnRequest request, String ipAddress) {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));

        // Ownership enforcement
        if (order.getUser() != null && !order.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new ForbiddenException("Access denied: You can only request returns on your own orders.");
        }

        // Status check
        if (order.getStatus() != OrderStatus.DELIVERED && order.getStatus() != OrderStatus.PICKED_UP && order.getStatus() != OrderStatus.COMPLETED) {
            throw new BadRequestException("Return or exchange requests are only eligible for delivered or picked up orders.");
        }

        // 7-day eligibility rule
        LocalDateTime deliveryTime = order.getDeliveredAt() != null ? order.getDeliveredAt() : order.getUpdatedAt();
        if (deliveryTime != null) {
            long daysSinceDelivery = ChronoUnit.DAYS.between(deliveryTime, LocalDateTime.now());
            if (daysSinceDelivery > returnEligibilityDays) {
                throw new BadRequestException(String.format(
                        "The return window for this order has expired (%d days since delivery, policy is %d days).",
                        daysSinceDelivery, returnEligibilityDays));
            }
        }

        if (order.getItems() == null) {
            throw new BadRequestException("Order contains no items.");
        }

        OrderItem orderItem = order.getItems().stream()
                .filter(item -> request.getOrderItemId().equals(item.getId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found with id: " + request.getOrderItemId()));

        if (orderItem.isReturned() || returnRepository.existsByOrderItem_Id(orderItem.getId())) {
            throw new BadRequestException("A return or exchange request has already been processed or is active for this item.");
        }

        Product replacementProduct = null;
        if (request.getRequestType() == RequestType.EXCHANGE) {
            if (request.getReplacementProductId() == null) {
                throw new BadRequestException("Please select a replacement product for exchange.");
            }
            replacementProduct = productRepository.findById(request.getReplacementProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Replacement product not found"));

            if (!replacementProduct.isActive() || replacementProduct.getStockQuantity() < orderItem.getQuantity()) {
                throw new BadRequestException(String.format("Replacement product '%s' does not have sufficient stock available for exchange.",
                        replacementProduct.getName()));
            }
        }

        String prefix = (request.getRequestType() == RequestType.RETURN) ? "RET-" : "EXC-";
        String requestNumber = prefix + LocalDateTime.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        ReturnExchangeRequest returnRequest = ReturnExchangeRequest.builder()
                .requestNumber(requestNumber)
                .order(order)
                .orderItem(orderItem)
                .user(user)
                .requestType(request.getRequestType())
                .reason(request.getReason())
                .reasonDetails(request.getReasonDetails() != null ? request.getReasonDetails().trim() : null)
                .replacementProduct(replacementProduct)
                .status(ReturnStatus.REQUESTED)
                .build();

        ReturnExchangeRequest saved = returnRepository.save(returnRequest);

        auditLogService.log(
                user.getEmail(),
                request.getRequestType() == RequestType.RETURN ? AuditAction.RETURN_REQUEST : AuditAction.EXCHANGE_REQUEST,
                "RETURN_EXCHANGE",
                saved.getId(),
                "Submitted " + request.getRequestType() + " request " + saved.getRequestNumber() + " for '" + orderItem.getProductName() + "'",
                ipAddress
        );

        return mapToDto(saved);
    }

    public List<ReturnExchangeRequestDto> getCustomerRequests() {
        String email = SecurityUtils.getCurrentUserEmail();
        return returnRepository.findByUser_EmailOrderByCreatedAtDesc(email).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ReturnExchangeRequestDto> getAllRequests() {
        return returnRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ReturnExchangeRequestDto> getRequestsByStatus(ReturnStatus status) {
        return returnRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ReturnExchangeRequestDto getRequestById(String id) {
        ReturnExchangeRequest request = returnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Return request not found with id: " + id));

        if (!SecurityUtils.isStaffOrAbove() && (request.getUser() == null || !request.getUser().getEmail().equalsIgnoreCase(SecurityUtils.getCurrentUserEmail()))) {
            throw new ForbiddenException("Access denied: You do not have permission to view this request.");
        }

        return mapToDto(request);
    }

    public ReturnExchangeRequestDto processRequest(String requestId, ProcessReturnRequest processDto, String ipAddress) {
        ReturnExchangeRequest request = returnRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Return request not found with id: " + requestId));

        ReturnStatus newStatus = processDto.getStatus();
        request.setStatus(newStatus);
        if (processDto.getAdminNotes() != null) {
            request.setAdminNotes(processDto.getAdminNotes().trim());
        }

        OrderItem orderItem = request.getOrderItem();

        if (newStatus == ReturnStatus.APPROVED) {
            if (request.getRequestType() == RequestType.EXCHANGE && request.getReplacementProduct() != null) {
                Product replacement = request.getReplacementProduct();
                if (replacement.getStockQuantity() < orderItem.getQuantity()) {
                    throw new BadRequestException("Cannot approve exchange: Replacement product is now out of stock.");
                }
                replacement.setStockQuantity(replacement.getStockQuantity() - orderItem.getQuantity());
                productRepository.save(replacement);
            }
        } else if (newStatus == ReturnStatus.COMPLETED) {
            request.setProcessedAt(LocalDateTime.now());
            if (orderItem != null) {
                orderItem.setReturned(true);
            }

            // Also update the order document items list
            if (request.getOrder() != null && request.getOrder().getId() != null) {
                orderRepository.findById(request.getOrder().getId()).ifPresent(ord -> {
                    if (ord.getItems() != null) {
                        for (OrderItem it : ord.getItems()) {
                            if (it.getId().equals(orderItem.getId())) {
                                it.setReturned(true);
                            }
                        }
                        orderRepository.save(ord);
                    }
                });
            }

            // If it's a Return and restock is requested (only for non-damaged/non-expired items)
            if (request.getRequestType() == RequestType.RETURN && processDto.isRestockInventory()) {
                if (request.getReason() != ReturnReason.DAMAGED && request.getReason() != ReturnReason.EXPIRED) {
                    if (orderItem != null && orderItem.getProduct() != null && orderItem.getProduct().getId() != null) {
                        productRepository.findById(orderItem.getProduct().getId()).ifPresent(origProduct -> {
                            origProduct.setStockQuantity(origProduct.getStockQuantity() + orderItem.getQuantity());
                            productRepository.save(origProduct);
                        });
                    }
                }
            }
        }

        ReturnExchangeRequest saved = returnRepository.save(request);

        AuditAction auditAction = switch (newStatus) {
            case APPROVED -> (request.getRequestType() == RequestType.RETURN ? AuditAction.RETURN_APPROVE : AuditAction.EXCHANGE_APPROVE);
            case REJECTED -> (request.getRequestType() == RequestType.RETURN ? AuditAction.RETURN_REJECT : AuditAction.EXCHANGE_REJECT);
            case COMPLETED -> (request.getRequestType() == RequestType.RETURN ? AuditAction.RETURN_COMPLETE : AuditAction.EXCHANGE_COMPLETE);
            default -> AuditAction.PRODUCT_UPDATE;
        };

        auditLogService.log(
                SecurityUtils.getCurrentUserEmail(),
                auditAction,
                "RETURN_EXCHANGE",
                saved.getId(),
                String.format("Processed %s request %s to status %s", request.getRequestType(), saved.getRequestNumber(), newStatus),
                ipAddress
        );

        return mapToDto(saved);
    }

    public ReturnExchangeRequestDto mapToDto(ReturnExchangeRequest r) {
        if (r == null) return null;
        return ReturnExchangeRequestDto.builder()
                .id(r.getId())
                .requestNumber(r.getRequestNumber())
                .orderId(r.getOrder() != null ? r.getOrder().getId() : null)
                .orderNumber(r.getOrder() != null ? r.getOrder().getOrderNumber() : "")
                .orderItemId(r.getOrderItem() != null ? r.getOrderItem().getId() : null)
                .productName(r.getOrderItem() != null ? r.getOrderItem().getProductName() : "")
                .productImageUrl(r.getOrderItem() != null ? r.getOrderItem().getProductImageUrl() : null)
                .itemQuantity(r.getOrderItem() != null ? r.getOrderItem().getQuantity() : 0)
                .userId(r.getUser() != null ? r.getUser().getId() : null)
                .userEmail(r.getUser() != null ? r.getUser().getEmail() : "")
                .userName(r.getUser() != null ? r.getUser().getName() : "")
                .requestType(r.getRequestType())
                .reason(r.getReason())
                .reasonDetails(r.getReasonDetails())
                .replacementProductId(r.getReplacementProduct() != null ? r.getReplacementProduct().getId() : null)
                .replacementProductName(r.getReplacementProduct() != null ? r.getReplacementProduct().getName() : null)
                .status(r.getStatus())
                .adminNotes(r.getAdminNotes())
                .createdAt(r.getCreatedAt())
                .processedAt(r.getProcessedAt())
                .build();
    }
}
