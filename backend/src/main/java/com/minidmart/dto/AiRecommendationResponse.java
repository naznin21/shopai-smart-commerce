package com.minidmart.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiRecommendationResponse {
    private String title;
    private String subtitle;
    private List<ProductDto> products;
}
