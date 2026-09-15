package com.minidmart.entity;

import com.minidmart.enums.RequestType;
import com.minidmart.enums.ReturnReason;
import com.minidmart.enums.ReturnStatus;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "return_exchange_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnExchangeRequest {

    @Id
    private String id;

    @Indexed(unique = true)
    private String requestNumber;

    private Order order;

    private OrderItem orderItem;

    private User user;

    private RequestType requestType;

    private ReturnReason reason;

    private String reasonDetails;

    private Product replacementProduct;

    private ReturnStatus status;

    private String adminNotes;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime processedAt;
}
