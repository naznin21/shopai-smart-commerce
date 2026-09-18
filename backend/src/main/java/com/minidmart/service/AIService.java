package com.minidmart.service;

import com.minidmart.dto.*;
import com.minidmart.entity.Category;
import com.minidmart.entity.Order;
import com.minidmart.entity.Product;
import com.minidmart.repository.CategoryRepository;
import com.minidmart.repository.OrderRepository;
import com.minidmart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class AIService {

    private final ProductRepository productRepository;
    private final ProductService productService;
    private final CategoryRepository categoryRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final MongoTemplate mongoTemplate;

    @Value("${app.ai.gemini.api-key:}")
    private String apiKey;

    @Value("${app.ai.gemini.model:gemini-1.5-flash}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Enhanced AI Shopping Assistant Chat Endpoint
     */
    public AiChatResponse chat(AiChatRequest request) {
        String userMsg = request.getMessage() != null ? request.getMessage().trim() : "";
        String userEmail = request.getUserEmail() != null ? request.getUserEmail().trim() : "";

        if (userMsg.isEmpty()) {
            return AiChatResponse.builder()
                    .reply("Hello! I'm your ShopAI Shopping Assistant. How can I help you with your groceries today?")
                    .suggestedProducts(Collections.emptyList())
                    .quickActions(List.of("Healthy Breakfast under ₹300", "Track My Order", "Recipe Ingredient Bundles", "Express 1-Hour Pickup"))
                    .mode("HEURISTIC_FALLBACK")
                    .intent("GENERAL")
                    .build();
        }

        String lowerMsg = userMsg.toLowerCase();

        // 1. INTENT: ORDER TRACKING & STATUS
        if (isOrderTrackingQuery(lowerMsg)) {
            if (!userEmail.isEmpty()) {
                List<Order> userOrders = orderRepository.findTop5ByUser_EmailOrderByCreatedAtDesc(userEmail);
                if (!userOrders.isEmpty()) {
                    Order latest = userOrders.get(0);
                    OrderDto latestDto = orderService.mapToDto(latest);
                    String replyText = String.format(
                            "Here is the live status for your latest order #%s:\n• Status: %s\n• Fulfillment: %s\n• Items: %d product(s)\n• Total Amount: ₹%.2f\n\nIs there anything else I can assist you with regarding this order?",
                            latest.getOrderNumber(),
                            latest.getStatus(),
                            latest.getOrderType() != null ? latest.getOrderType().name().replace("_", " ") : "HOME DELIVERY",
                            latest.getItems() != null ? latest.getItems().size() : 0,
                            latest.getTotalAmount()
                    );
                    return AiChatResponse.builder()
                            .reply(replyText)
                            .latestOrder(latestDto)
                            .intent("ORDER_TRACKING")
                            .quickActions(List.of("View Order Details", "Order Cancellation Help", "Return / Exchange Request"))
                            .mode("SMART_ASSISTANT")
                            .build();
                } else {
                    return AiChatResponse.builder()
                            .reply("I checked your ShopAI profile, but you haven't placed any orders yet! Browse our fresh catalog and start shopping today.")
                            .intent("ORDER_TRACKING")
                            .quickActions(List.of("Browse Catalog", "Featured Products", "Deals of the Day"))
                            .mode("SMART_ASSISTANT")
                            .build();
                }
            } else {
                return AiChatResponse.builder()
                        .reply("Please sign in to your ShopAI account so I can pull up your live order status and tracking details automatically!")
                        .intent("ORDER_TRACKING")
                        .quickActions(List.of("Go to Login Screen", "Browse Store Catalog"))
                        .mode("SMART_ASSISTANT")
                        .build();
            }
        }

        // 2. INTENT: RECIPE & MEAL BUNDLE BUILDER
        if (isRecipeQuery(lowerMsg)) {
            RecipeBundleResult recipeBundle = buildRecipeBundle(lowerMsg);
            if (!recipeBundle.getProducts().isEmpty()) {
                String replyText = String.format(
                        "Here is your customized '%s' ingredient bundle from ShopAI fresh catalog! Total bundle cost: ₹%.2f. Click below to add all ingredients to your cart instantly.",
                        recipeBundle.getDishName(),
                        recipeBundle.getTotalPrice()
                );
                return AiChatResponse.builder()
                        .reply(replyText)
                        .suggestedProducts(recipeBundle.getProducts())
                        .recipeTotalPrice(recipeBundle.getTotalPrice())
                        .intent("RECIPE_BUNDLE")
                        .quickActions(List.of("Add Entire Bundle to Cart", "Healthy Snacks", "Tea & Coffee Essentials"))
                        .mode("SMART_ASSISTANT")
                        .build();
            }
        }

        // 3. INTENT: STORE POLICY & LOGISTICS
        if (isStorePolicyQuery(lowerMsg)) {
            String policyReply = getStorePolicyReply(lowerMsg);
            return AiChatResponse.builder()
                    .reply(policyReply)
                    .intent("STORE_POLICY")
                    .quickActions(List.of("Browse Store Catalog", "Express Pickup Slots", "Free Delivery Threshold"))
                    .mode("SMART_ASSISTANT")
                    .build();
        }

        // 4. GENERAL / PRODUCT SEARCH
        List<ProductDto> candidates = findProductsForQuery(userMsg, 6);

        // Try Gemini API if key is configured
        if (apiKey != null && !apiKey.trim().isEmpty()) {
            try {
                String prompt = buildChatPrompt(userMsg, candidates, userEmail);
                String geminiReply = callGeminiApi(prompt);
                if (geminiReply != null && !geminiReply.trim().isEmpty()) {
                    return AiChatResponse.builder()
                            .reply(geminiReply.trim())
                            .suggestedProducts(candidates)
                            .quickActions(List.of("Add All to Cart", "View More Products", "Ask Another Question"))
                            .mode("GEMINI_LLM")
                            .intent("PRODUCT_SEARCH")
                            .build();
                }
            } catch (Exception e) {
                log.warn("Gemini API call failed, falling back to smart heuristic engine: {}", e.getMessage());
            }
        }

        // Built-in Smart Heuristic Engine Fallback
        String heuristicReply = generateHeuristicChatReply(userMsg, candidates);
        return AiChatResponse.builder()
                .reply(heuristicReply)
                .suggestedProducts(candidates)
                .quickActions(List.of("Add All to Cart", "Healthy Breakfast under ₹300", "Dairy & Bakery"))
                .mode("HEURISTIC_FALLBACK")
                .intent("PRODUCT_SEARCH")
                .build();
    }

    /**
     * AI Product Recommendations Endpoint
     */
    public AiRecommendationResponse getRecommendations(String productId, String categoryId, String userEmail) {
        List<Product> matched = new ArrayList<>();

        if (productId != null && !productId.trim().isEmpty()) {
            Optional<Product> prodOpt = productRepository.findById(productId);
            if (prodOpt.isPresent()) {
                Product p = prodOpt.get();
                if (p.getCategory() != null) {
                    matched = mongoTemplate.find(
                            Query.query(Criteria.where("active").is(true)
                                    .and("category.id").is(p.getCategory().getId())
                                    .and("id").ne(p.getId())).limit(6),
                            Product.class
                    );
                }
            }
        }

        if (matched.isEmpty() && categoryId != null && !categoryId.trim().isEmpty()) {
            matched = mongoTemplate.find(
                    Query.query(Criteria.where("active").is(true)
                            .and("category.id").is(categoryId)).limit(6),
                    Product.class
            );
        }

        if (matched.isEmpty()) {
            matched = mongoTemplate.find(
                    Query.query(Criteria.where("active").is(true)
                            .and("stockQuantity").gt(0)).limit(6),
                    Product.class
            );
        }

        List<ProductDto> dtos = matched.stream()
                .map(productService::mapToDto)
                .collect(Collectors.toList());

        return AiRecommendationResponse.builder()
                .title("ShopAI Smart Recommendations")
                .subtitle("Contextual picks tailored for your current shopping session")
                .products(dtos)
                .build();
    }

    /**
     * Natural Language Product Search Endpoint
     */
    public AiSearchResponse searchNaturalLanguage(String queryStr) {
        if (queryStr == null) queryStr = "";
        String cleanQuery = queryStr.trim();
        String lowerQuery = cleanQuery.toLowerCase();

        Double maxPrice = null;
        Pattern pricePattern = Pattern.compile("(?:under|below|less than|<|within|budget of)\\s*₹?\\s*(\\d+)");
        Matcher priceMatcher = pricePattern.matcher(lowerQuery);
        if (priceMatcher.find()) {
            try {
                maxPrice = Double.parseDouble(priceMatcher.group(1));
            } catch (NumberFormatException ignored) {}
        }

        String matchedCategoryName = null;
        List<Category> allCategories = categoryRepository.findAll();
        for (Category cat : allCategories) {
            if (lowerQuery.contains(cat.getName().toLowerCase())) {
                matchedCategoryName = cat.getName();
                break;
            }
        }

        List<String> keywords = new ArrayList<>();
        String[] words = lowerQuery.replaceAll("[^a-z0-9\\s]", "").split("\\s+");
        List<String> stopWords = List.of("show", "me", "find", "get", "for", "the", "a", "an", "under", "below", "less", "than", "products", "items", "i", "need", "want");
        for (String w : words) {
            if (w.length() > 2 && !stopWords.contains(w)) {
                keywords.add(w);
            }
        }

        Query mongoQuery = new Query();
        List<Criteria> criteriaList = new ArrayList<>();
        criteriaList.add(Criteria.where("active").is(true));

        if (maxPrice != null) {
            criteriaList.add(Criteria.where("price").lte(BigDecimal.valueOf(maxPrice)));
        }

        if (matchedCategoryName != null) {
            criteriaList.add(Criteria.where("category.name").regex(matchedCategoryName, "i"));
        }

        if (!keywords.isEmpty()) {
            List<Criteria> keywordCriteria = new ArrayList<>();
            for (String kw : keywords) {
                keywordCriteria.add(Criteria.where("name").regex(kw, "i"));
                keywordCriteria.add(Criteria.where("description").regex(kw, "i"));
            }
            criteriaList.add(new Criteria().orOperator(keywordCriteria.toArray(new Criteria[0])));
        }

        mongoQuery.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        mongoQuery.limit(20);

        List<Product> matchedProducts = mongoTemplate.find(mongoQuery, Product.class);

        if (matchedProducts.isEmpty()) {
            matchedProducts = mongoTemplate.find(
                    Query.query(Criteria.where("active").is(true)).limit(12),
                    Product.class
            );
        }

        List<ProductDto> productDtos = matchedProducts.stream()
                .map(productService::mapToDto)
                .collect(Collectors.toList());

        String interpreted = String.format("Interpreted natural language search for: '%s'", cleanQuery);
        if (maxPrice != null) interpreted += String.format(" [Max Price: ₹%.0f]", maxPrice);
        if (matchedCategoryName != null) interpreted += String.format(" [Category: %s]", matchedCategoryName);

        return AiSearchResponse.builder()
                .interpretedQuery(interpreted)
                .keywords(keywords)
                .maxPrice(maxPrice)
                .categoryName(matchedCategoryName)
                .products(productDtos)
                .build();
    }

    /**
     * AI Product Description Generator Endpoint
     */
    public AiDescriptionResponse generateProductDescription(AiDescriptionRequest request) {
        String name = request.getName() != null ? request.getName().trim() : "Grocery Item";
        String category = request.getCategoryName() != null ? request.getCategoryName().trim() : "Grocery";
        String unit = request.getUnit() != null ? request.getUnit().trim() : "1 pack";
        BigDecimal price = request.getPrice() != null ? request.getPrice() : BigDecimal.ZERO;

        if (apiKey != null && !apiKey.trim().isEmpty()) {
            try {
                String prompt = String.format(
                        "Write a compelling 2-sentence retail product description and 3 feature bullet points for a grocery item named '%s' in category '%s', priced at ₹%s per %s.",
                        name, category, price, unit
                );
                String geminiOutput = callGeminiApi(prompt);
                if (geminiOutput != null && !geminiOutput.trim().isEmpty()) {
                    return AiDescriptionResponse.builder()
                            .generatedDescription(geminiOutput.trim())
                            .bulletPoints(List.of(
                                    "Farm fresh quality guaranteed",
                                    "Hygienically packaged and store quality-checked",
                                    "Optimal value for daily household needs"
                            ))
                            .suggestedTagline("Freshness you can trust, prices you'll love!")
                            .build();
                }
            } catch (Exception e) {
                log.warn("Gemini API call failed for product description generation: {}", e.getMessage());
            }
        }

        String desc = String.format(
                "Premium quality %s from our fresh %s selection (%s). Sourced with strict quality and hygiene standards to ensure maximum flavor, nutrition, and value for your kitchen.",
                name, category, unit
        );

        List<String> bullets = List.of(
                "100% Quality Assured & Freshly Sourced",
                "Hygienically packed for long-lasting freshness",
                "Ideal staple for nutritious family meals"
        );

        String tagline = String.format("Experience fresh quality with %s today!", name);

        return AiDescriptionResponse.builder()
                .generatedDescription(desc)
                .bulletPoints(bullets)
                .suggestedTagline(tagline)
                .build();
    }

    // --- Helper Methods ---

    private boolean isOrderTrackingQuery(String text) {
        return text.contains("order") || text.contains("track") || text.contains("status")
                || text.contains("where is my") || text.contains("delivery status")
                || text.contains("package") || text.contains("shipment");
    }

    private boolean isRecipeQuery(String text) {
        return text.contains("recipe") || text.contains("ingredient") || text.contains("cook")
                || text.contains("make") || text.contains("paneer") || text.contains("biryani")
                || text.contains("pasta") || text.contains("tea time") || text.contains("breakfast")
                || text.contains("smoothie") || text.contains("salad");
    }

    private boolean isStorePolicyQuery(String text) {
        return text.contains("delivery fee") || text.contains("express pickup")
                || text.contains("store time") || text.contains("return policy")
                || text.contains("refund") || text.contains("payment option")
                || text.contains("free delivery") || text.contains("cash on delivery");
    }

    private String getStorePolicyReply(String lowerMsg) {
        if (lowerMsg.contains("return") || lowerMsg.contains("refund")) {
            return "ShopAI Return Policy: We accept return and exchange requests within 7 days of delivery or pickup for quality issues, damaged goods, or incorrect items. You can request a return directly from your Order History screen!";
        }
        if (lowerMsg.contains("delivery") || lowerMsg.contains("fee")) {
            return "ShopAI Shipping Policy: Standard Home Delivery is ₹40. FREE Home Delivery is automatically applied on all orders above ₹500! We also offer 1-Hour Express Store Pickup with zero delivery fees.";
        }
        if (lowerMsg.contains("pickup") || lowerMsg.contains("slot")) {
            return "Express Store Pickup: Reserve your convenient 1-Hour pickup slot during checkout. Our store fulfillment staff will pack your order fresh and have it ready at our customer station!";
        }
        return "ShopAI Smart Commerce: Express 1-Hour Store Pickup, Free Delivery over ₹500, 7-day easy returns, and secure payments via COD or Online UPI/Cards!";
    }

    @lombok.Getter
    @lombok.AllArgsConstructor
    private static class RecipeBundleResult {
        private String dishName;
        private List<ProductDto> products;
        private BigDecimal totalPrice;
    }

    private RecipeBundleResult buildRecipeBundle(String lowerMsg) {
        String dishName = "Custom Recipe";
        List<String> keywords = new ArrayList<>();

        if (lowerMsg.contains("paneer")) {
            dishName = "Paneer Butter Masala";
            keywords = List.of("paneer", "butter", "tomato", "cream", "masala");
        } else if (lowerMsg.contains("biryani")) {
            dishName = "Royal Basmati Biryani";
            keywords = List.of("basmati", "onion", "oil", "masala");
        } else if (lowerMsg.contains("tea")) {
            dishName = "Masala Tea & Snacks";
            keywords = List.of("tea", "milk", "biscuit", "sugar");
        } else if (lowerMsg.contains("breakfast")) {
            dishName = "Healthy Morning Breakfast";
            keywords = List.of("bread", "butter", "milk", "eggs", "juice");
        } else if (lowerMsg.contains("salad") || lowerMsg.contains("fruit")) {
            dishName = "Fresh Farm Fruit & Salad";
            keywords = List.of("apple", "banana", "cucumber", "lemon");
        } else {
            dishName = "Grocery Staples";
            keywords = List.of("atta", "rice", "dal", "oil");
        }

        List<ProductDto> dtos = findProductsForKeywords(keywords, 4);
        BigDecimal total = dtos.stream()
                .map(ProductDto::getEffectivePrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new RecipeBundleResult(dishName, dtos, total);
    }

    private List<ProductDto> findProductsForKeywords(List<String> keywords, int limit) {
        List<Criteria> criteriaList = new ArrayList<>();
        for (String kw : keywords) {
            criteriaList.add(Criteria.where("name").regex(kw, "i"));
            criteriaList.add(Criteria.where("description").regex(kw, "i"));
            criteriaList.add(Criteria.where("category.name").regex(kw, "i"));
        }
        Query q = Query.query(Criteria.where("active").is(true).orOperator(criteriaList.toArray(new Criteria[0]))).limit(limit);
        List<Product> products = mongoTemplate.find(q, Product.class);
        if (products.isEmpty()) {
            products = mongoTemplate.find(Query.query(Criteria.where("active").is(true)).limit(limit), Product.class);
        }
        return products.stream().map(productService::mapToDto).collect(Collectors.toList());
    }

    private List<ProductDto> findProductsForQuery(String queryStr, int limit) {
        String lower = queryStr.toLowerCase();
        String[] words = lower.replaceAll("[^a-z0-9\\s]", "").split("\\s+");
        List<String> keywords = Arrays.stream(words)
                .filter(w -> w.length() > 2)
                .collect(Collectors.toList());

        List<Product> products;
        if (keywords.isEmpty()) {
            products = mongoTemplate.find(Query.query(Criteria.where("active").is(true)).limit(limit), Product.class);
        } else {
            List<Criteria> criteria = new ArrayList<>();
            for (String kw : keywords) {
                criteria.add(Criteria.where("name").regex(kw, "i"));
                criteria.add(Criteria.where("description").regex(kw, "i"));
                criteria.add(Criteria.where("category.name").regex(kw, "i"));
            }
            Query q = Query.query(Criteria.where("active").is(true).orOperator(criteria.toArray(new Criteria[0]))).limit(limit);
            products = mongoTemplate.find(q, Product.class);
            if (products.isEmpty()) {
                products = mongoTemplate.find(Query.query(Criteria.where("active").is(true)).limit(limit), Product.class);
            }
        }

        return products.stream().map(productService::mapToDto).collect(Collectors.toList());
    }

    private String generateHeuristicChatReply(String userMsg, List<ProductDto> candidates) {
        String lower = userMsg.toLowerCase();
        if (lower.contains("hello") || lower.contains("hi") || lower.contains("hey")) {
            return "Welcome to ShopAI! I am your AI Shopping Assistant. Ask me for fresh groceries, live order tracking, or custom recipe bundles!";
        }
        if (lower.contains("healthy") || lower.contains("keto") || lower.contains("diet")) {
            return "Here are top healthy, nutrient-rich options from our fresh grocery aisle:";
        }
        if (lower.contains("snack") || lower.contains("biscuit") || lower.contains("tea") || lower.contains("coffee")) {
            return "Looking for delicious snack options? Here are top customer favorites for your pantry:";
        }
        if (lower.contains("milk") || lower.contains("dairy") || lower.contains("butter") || lower.contains("cheese")) {
            return "Check out our daily fresh dairy selection sourced directly from verified farms:";
        }
        if (!candidates.isEmpty()) {
            return String.format("Based on your query '%s', here are top recommended grocery products from ShopAI:", userMsg);
        }
        return "I found these top-rated fresh items for your kitchen. Feel free to ask me for healthy options, recipes, or budget-friendly picks!";
    }

    private String callGeminiApi(String prompt) {
        String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", model, apiKey);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> body = Map.of("contents", List.of(content));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map bodyMap = response.getBody();
                List candidates = (List) bodyMap.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map candidate = (Map) candidates.get(0);
                    Map contentMap = (Map) candidate.get("content");
                    if (contentMap != null) {
                        List parts = (List) contentMap.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            Map firstPart = (Map) parts.get(0);
                            return (String) firstPart.get("text");
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error executing HTTP POST call to Gemini API: {}", e.getMessage());
        }
        return null;
    }

    private String buildChatPrompt(String userMsg, List<ProductDto> candidates, String userEmail) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are ShopAI, a friendly and highly efficient AI shopping assistant for a modern grocery e-commerce store.\n");
        sb.append("User Email: ").append(userEmail.isEmpty() ? "Guest" : userEmail).append("\n");
        sb.append("User Question: ").append(userMsg).append("\n\n");
        sb.append("Available Catalog Context:\n");
        for (ProductDto p : candidates) {
            sb.append(String.format("- %s (Category: %s, Price: ₹%s/%s)\n",
                    p.getName(), p.getCategory() != null ? p.getCategory().getName() : "Grocery", p.getEffectivePrice(), p.getUnit()));
        }
        sb.append("\nProvide a concise, helpful 2-sentence recommendation.");
        return sb.toString();
    }
}
