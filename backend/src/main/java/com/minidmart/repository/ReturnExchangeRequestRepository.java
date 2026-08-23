package com.minidmart.repository;

import com.minidmart.entity.ReturnExchangeRequest;
import com.minidmart.enums.ReturnStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReturnExchangeRequestRepository extends JpaRepository<ReturnExchangeRequest, Long> {
    List<ReturnExchangeRequest> findByUser_EmailOrderByCreatedAtDesc(String email);
    List<ReturnExchangeRequest> findAllByOrderByCreatedAtDesc();
    List<ReturnExchangeRequest> findByStatusOrderByCreatedAtDesc(ReturnStatus status);
    Optional<ReturnExchangeRequest> findByOrderItem_Id(Long orderItemId);
    boolean existsByOrderItem_Id(Long orderItemId);
    long countByStatus(ReturnStatus status);
}
