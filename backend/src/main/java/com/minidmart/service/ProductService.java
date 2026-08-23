package com.minidmart.service;

import com.minidmart.dto.CategoryDto;
import com.minidmart.dto.ProductDto;
import com.minidmart.dto.ProductRequest;
import com.minidmart.dto.StockUpdateRequest;
import com.minidmart.entity.Category;
import com.minidmart.entity.Product;
import com.minidmart.enums.AuditAction;
import com.minidmart.exception.BadRequestException;
import com.minidmart.exception.ResourceNotFoundException;
import com.minidmart.repository.CategoryRepository;
import com.minidmart.repository.ProductRepository;
import com.minidmart.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<ProductDto> searchProducts(
            String keyword,
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            boolean inStockOnly,
            String sortBy,
            int page,
            int size) {

        Sort sort = switch (sortBy != null ? sortBy.toLowerCase() : "newest") {
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };

        Pageable pageable = PageRequest.of(page, size, sort);
        String cleanedKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        return productRepository.searchProducts(cleanedKeyword, categoryId, minPrice, maxPrice, inStockOnly, pageable)
                .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToDto(product);
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getFeaturedProducts() {
        return productRepository.findTop8ByActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDto createProduct(ProductRequest request, String ipAddress) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        if (request.getDiscountPrice() != null && request.getDiscountPrice().compareTo(request.getPrice()) > 0) {
            throw new BadRequestException("Discount price cannot be higher than original price");
        }

        Product product = Product.builder()
                .name(request.getName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .price(request.getPrice())
                .discountPrice(request.getDiscountPrice())
                .category(category)
                .imageUrl(request.getImageUrl())
                .stockQuantity(request.getStockQuantity())
                .lowStockThreshold(request.getLowStockThreshold() != null ? request.getLowStockThreshold() : 5)
                .unit(request.getUnit() != null ? request.getUnit().trim() : "1 unit")
                .active(request.isActive())
                .build();

        Product saved = productRepository.save(product);

        auditLogService.log(
                SecurityUtils.getCurrentUserEmail(),
                AuditAction.PRODUCT_CREATE,
                "PRODUCT",
                String.valueOf(saved.getId()),
                "Created product: " + saved.getName() + " with stock: " + saved.getStockQuantity(),
                ipAddress
        );

        return mapToDto(saved);
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductRequest request, String ipAddress) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        if (request.getDiscountPrice() != null && request.getDiscountPrice().compareTo(request.getPrice()) > 0) {
            throw new BadRequestException("Discount price cannot be higher than original price");
        }

        product.setName(request.getName().trim());
        product.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        product.setPrice(request.getPrice());
        product.setDiscountPrice(request.getDiscountPrice());
        product.setCategory(category);
        product.setImageUrl(request.getImageUrl());
        product.setStockQuantity(request.getStockQuantity());
        if (request.getLowStockThreshold() != null) {
            product.setLowStockThreshold(request.getLowStockThreshold());
        }
        product.setUnit(request.getUnit() != null ? request.getUnit().trim() : "1 unit");
        product.setActive(request.isActive());

        Product updated = productRepository.save(product);

        auditLogService.log(
                SecurityUtils.getCurrentUserEmail(),
                AuditAction.PRODUCT_UPDATE,
                "PRODUCT",
                String.valueOf(updated.getId()),
                "Updated product: " + updated.getName(),
                ipAddress
        );

        return mapToDto(updated);
    }

    @Transactional
    public ProductDto updateProductStock(Long id, StockUpdateRequest request, String ipAddress) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        int oldStock = product.getStockQuantity();
        product.setStockQuantity(request.getStockQuantity());
        if (request.getLowStockThreshold() != null) {
            product.setLowStockThreshold(request.getLowStockThreshold());
        }

        Product updated = productRepository.save(product);

        auditLogService.log(
                SecurityUtils.getCurrentUserEmail(),
                AuditAction.STOCK_UPDATE,
                "PRODUCT",
                String.valueOf(updated.getId()),
                String.format("Updated stock for '%s' from %d to %d", updated.getName(), oldStock, request.getStockQuantity()),
                ipAddress
        );

        return mapToDto(updated);
    }

    @Transactional
    public void deleteProduct(Long id, String ipAddress) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setActive(false);
        productRepository.save(product);

        auditLogService.log(
                SecurityUtils.getCurrentUserEmail(),
                AuditAction.PRODUCT_DELETE,
                "PRODUCT",
                String.valueOf(product.getId()),
                "Deactivated product: " + product.getName(),
                ipAddress
        );
    }

    public ProductDto mapToDto(Product product) {
        BigDecimal effectivePrice = product.getEffectivePrice();

        Integer discountPercentage = null;
        if (product.getDiscountPrice() != null && product.getDiscountPrice().compareTo(BigDecimal.ZERO) > 0 && product.getPrice().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal diff = product.getPrice().subtract(product.getDiscountPrice());
            if (diff.compareTo(BigDecimal.ZERO) > 0) {
                discountPercentage = diff.multiply(BigDecimal.valueOf(100))
                        .divide(product.getPrice(), 0, RoundingMode.HALF_UP)
                        .intValue();
            }
        }

        String stockStatus;
        if (product.getStockQuantity() <= 0) {
            stockStatus = "OUT_OF_STOCK";
        } else if (product.getStockQuantity() <= product.getLowStockThreshold()) {
            stockStatus = "LOW_STOCK";
        } else {
            stockStatus = "IN_STOCK";
        }

        CategoryDto categoryDto = CategoryDto.builder()
                .id(product.getCategory().getId())
                .name(product.getCategory().getName())
                .description(product.getCategory().getDescription())
                .imageUrl(product.getCategory().getImageUrl())
                .active(product.getCategory().isActive())
                .build();

        return ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .discountPrice(product.getDiscountPrice())
                .effectivePrice(effectivePrice)
                .discountPercentage(discountPercentage)
                .category(categoryDto)
                .imageUrl(product.getImageUrl())
                .stockQuantity(product.getStockQuantity())
                .lowStockThreshold(product.getLowStockThreshold())
                .unit(product.getUnit())
                .active(product.isActive())
                .stockStatus(stockStatus)
                .createdAt(product.getCreatedAt())
                .build();
    }
}
