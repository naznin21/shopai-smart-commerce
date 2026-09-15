package com.minidmart.service;

import com.minidmart.dto.CategoryDto;
import com.minidmart.dto.CategoryRequest;
import com.minidmart.entity.Category;
import com.minidmart.enums.AuditAction;
import com.minidmart.exception.ConflictException;
import com.minidmart.exception.ResourceNotFoundException;
import com.minidmart.repository.CategoryRepository;
import com.minidmart.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final AuditLogService auditLogService;

    public List<CategoryDto> getActiveCategories() {
        return categoryRepository.findByActiveTrue().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public CategoryDto getCategoryById(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return mapToDto(category);
    }

    public CategoryDto createCategory(CategoryRequest request, String ipAddress) {
        String trimmedName = request.getName().trim();
        if (categoryRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new ConflictException("Category with name '" + trimmedName + "' already exists");
        }

        Category category = Category.builder()
                .name(trimmedName)
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .imageUrl(request.getImageUrl())
                .active(request.isActive())
                .build();

        Category savedCategory = categoryRepository.save(category);

        auditLogService.log(
                SecurityUtils.getCurrentUserEmail(),
                AuditAction.PRODUCT_CREATE,
                "CATEGORY",
                savedCategory.getId(),
                "Created category: " + savedCategory.getName(),
                ipAddress
        );

        return mapToDto(savedCategory);
    }

    public CategoryDto updateCategory(String id, CategoryRequest request, String ipAddress) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        String trimmedName = request.getName().trim();
        if (!category.getName().equalsIgnoreCase(trimmedName) && categoryRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new ConflictException("Category with name '" + trimmedName + "' already exists");
        }

        category.setName(trimmedName);
        category.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        category.setImageUrl(request.getImageUrl());
        category.setActive(request.isActive());

        Category updated = categoryRepository.save(category);

        auditLogService.log(
                SecurityUtils.getCurrentUserEmail(),
                AuditAction.PRODUCT_UPDATE,
                "CATEGORY",
                updated.getId(),
                "Updated category: " + updated.getName(),
                ipAddress
        );

        return mapToDto(updated);
    }

    public CategoryDto mapToDto(Category category) {
        if (category == null) return null;
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .active(category.isActive())
                .build();
    }
}
