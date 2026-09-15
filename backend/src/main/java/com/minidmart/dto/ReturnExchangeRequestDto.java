package com.minidmart.dto;

import com.minidmart.enums.RequestType;
import com.minidmart.enums.ReturnReason;
import com.minidmart.enums.ReturnStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReturnExchangeRequestDto {
    private String id;
    private String requestNumber;
    private String orderId;
    private String orderNumber;
    private String orderItemId;
    private String productName;
    private String productImageUrl;
    private Integer itemQuantity;
    private String userId;
    private String userEmail;
    private String userName;
    private RequestType requestType;
    private ReturnReason reason;
    private String reasonDetails;
    private String replacementProductId;
    private String replacementProductName;
    private ReturnStatus status;
    private String adminNotes;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
}
