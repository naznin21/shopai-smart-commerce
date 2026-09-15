package com.minidmart.controller;

import com.minidmart.dto.*;
import com.minidmart.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request) {
        return ResponseEntity.ok(aiService.chat(request));
    }

    @PostMapping("/recommendations")
    public ResponseEntity<AiRecommendationResponse> getRecommendations(
            @RequestParam(required = false) String productId,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String userEmail) {
        return ResponseEntity.ok(aiService.getRecommendations(productId, categoryId, userEmail));
    }

    @PostMapping("/search")
    public ResponseEntity<AiSearchResponse> search(@RequestBody AiSearchRequest request) {
        return ResponseEntity.ok(aiService.searchNaturalLanguage(request.getQuery()));
    }

    @PostMapping("/generate-description")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<AiDescriptionResponse> generateDescription(@RequestBody AiDescriptionRequest request) {
        return ResponseEntity.ok(aiService.generateProductDescription(request));
    }
}
