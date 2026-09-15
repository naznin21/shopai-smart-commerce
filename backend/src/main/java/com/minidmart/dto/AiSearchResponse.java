package com.minidmart.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiSearchResponse {
    private String interpretedQuery;
    private List<String> keywords;
    private Double maxPrice;
    private String categoryName;
    private List<ProductDto> products;
}
