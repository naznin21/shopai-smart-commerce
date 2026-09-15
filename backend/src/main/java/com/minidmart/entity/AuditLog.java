package com.minidmart.entity;

import com.minidmart.enums.AuditAction;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    private String id;

    private String userEmail;

    private AuditAction action;

    private String entityType;

    private String entityId;

    private String description;

    private String ipAddress;

    @CreatedDate
    private LocalDateTime timestamp;
}
