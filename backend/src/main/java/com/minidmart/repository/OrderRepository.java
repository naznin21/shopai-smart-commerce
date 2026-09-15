package com.minidmart.repository;

import com.minidmart.entity.Order;
import com.minidmart.enums.OrderStatus;
import com.minidmart.enums.OrderType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {

    List<Order> findByUser_IdOrderByCreatedAtDesc(String userId);

    List<Order> findByUser_EmailOrderByCreatedAtDesc(String email);

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    List<Order> findByOrderTypeOrderByCreatedAtDesc(OrderType orderType);

    List<Order> findByOrderTypeAndScheduledDateOrderByCreatedAtDesc(OrderType orderType, LocalDate scheduledDate);

    long countByStatus(OrderStatus status);

    long countByCreatedAtGreaterThanEqual(LocalDateTime since);

    List<Order> findByStatusNot(OrderStatus status);

    List<Order> findByStatusNotAndCreatedAtGreaterThanEqual(OrderStatus status, LocalDateTime since);

    List<Order> findTop5ByUser_EmailOrderByCreatedAtDesc(String email);

    List<Order> findTop10ByOrderByCreatedAtDesc();
}
