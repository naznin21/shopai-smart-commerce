package com.minidmart.dto;

import com.minidmart.enums.AuditAction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDto {
    private String id;
    private String userEmail;
    private AuditAction action;
    private String entityType;
    private String entityId;
    private String description;
    private String ipAddress;
    private LocalDateTime timestamp;
}
