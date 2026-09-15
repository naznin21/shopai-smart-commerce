package com.minidmart.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiChatResponse {
    private String reply;
    private List<ProductDto> suggestedProducts;
    private String mode; // "GEMINI_LLM" or "HEURISTIC_FALLBACK"
}
