package com.minidmart.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiDescriptionResponse {
    private String generatedDescription;
    private List<String> bulletPoints;
    private String suggestedTagline;
}
