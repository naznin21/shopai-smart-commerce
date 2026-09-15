package com.minidmart.repository;

import com.minidmart.entity.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {

    List<Product> findByActiveTrue();

    List<Product> findByCategory_IdAndActiveTrue(String categoryId);

    @Query("{ 'active': true, '$expr': { '$lte': ['$stockQuantity', '$lowStockThreshold'] } }")
    List<Product> findLowStockProducts();

    @Query(value = "{ 'active': true, '$expr': { '$lte': ['$stockQuantity', '$lowStockThreshold'] } }", count = true)
    long countLowStockProducts();

    long countByActiveTrueAndStockQuantityEquals(int stockQuantity);

    List<Product> findTop8ByActiveTrueOrderByCreatedAtDesc();
}
