package com.minidmart.repository;

import com.minidmart.entity.Cart;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends MongoRepository<Cart, String> {
    Optional<Cart> findByUser_Id(String userId);
    Optional<Cart> findByUser_Email(String email);
}
