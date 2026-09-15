package com.minidmart.repository;

import com.minidmart.entity.ReturnExchangeRequest;
import com.minidmart.enums.ReturnStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReturnExchangeRequestRepository extends MongoRepository<ReturnExchangeRequest, String> {
    List<ReturnExchangeRequest> findByUser_EmailOrderByCreatedAtDesc(String email);
    List<ReturnExchangeRequest> findAllByOrderByCreatedAtDesc();
    List<ReturnExchangeRequest> findByStatusOrderByCreatedAtDesc(ReturnStatus status);
    Optional<ReturnExchangeRequest> findByOrderItem_Id(String orderItemId);
    boolean existsByOrderItem_Id(String orderItemId);
    long countByStatus(ReturnStatus status);
}
