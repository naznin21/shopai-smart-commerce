package com.minidmart.service;

import com.minidmart.entity.PickupSlot;
import com.minidmart.repository.PickupSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
class PickupSlotInitializer {

    private final PickupSlotRepository pickupSlotRepository;

    public void createSlotIfAbsent(LocalDate date, String timeSlot, int defaultCapacity) {
        if (pickupSlotRepository.findBySlotDateAndTimeSlot(date, timeSlot).isPresent()) {
            return;
        }
        PickupSlot slot = PickupSlot.builder()
                .slotDate(date)
                .timeSlot(timeSlot)
                .maxCapacity(defaultCapacity)
                .bookedCount(0)
                .build();
        pickupSlotRepository.save(slot);
    }
}
