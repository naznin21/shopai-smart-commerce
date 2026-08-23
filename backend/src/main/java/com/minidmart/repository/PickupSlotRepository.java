package com.minidmart.repository;

import com.minidmart.entity.PickupSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PickupSlotRepository extends JpaRepository<PickupSlot, Long> {
    List<PickupSlot> findBySlotDateOrderByTimeSlotAsc(LocalDate slotDate);
    Optional<PickupSlot> findBySlotDateAndTimeSlot(LocalDate slotDate, String timeSlot);
    List<PickupSlot> findBySlotDateBetweenOrderBySlotDateAscTimeSlotAsc(LocalDate start, LocalDate end);
}
