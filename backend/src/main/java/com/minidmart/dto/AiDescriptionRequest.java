package com.minidmart.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiDescriptionRequest {
    private String name;
    private String categoryName;
    private BigDecimal price;
    private String unit;
    private String existingDescription;
}
