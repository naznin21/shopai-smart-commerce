package com.minidmart.dto;

import com.minidmart.enums.RequestType;
import com.minidmart.enums.ReturnReason;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateReturnRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotNull(message = "Order Item ID is required")
    private Long orderItemId;

    @NotNull(message = "Request type is required")
    private RequestType requestType;

    @NotNull(message = "Reason is required")
    private ReturnReason reason;

    private String reasonDetails;

    private Long replacementProductId; // For EXCHANGE
}
