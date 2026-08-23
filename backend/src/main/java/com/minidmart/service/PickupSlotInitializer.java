package com.minidmart.service;

import com.minidmart.entity.PickupSlot;
import com.minidmart.repository.PickupSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Ensures a single default pickup slot row exists, one slot per call.
 * <p>
 * Runs in its own transaction (REQUIRES_NEW) so that if a concurrent request
 * for the same date wins the race and inserts the row first, the resulting
 * unique-constraint violation only rolls back this one small transaction —
 * it never poisons the caller's (larger) transaction. This matters on
 * PostgreSQL in particular: once any statement in a transaction fails,
 * Postgres aborts the whole transaction and refuses further statements on
 * it, so this method deliberately lets the exception propagate out (rather
 * than swallowing it here) — that lets Spring's transaction interceptor roll
 * back *this* small transaction cleanly. The caller, running in its own
 * separate and still-healthy transaction, is the right place to catch it.
 */
@Component
@RequiredArgsConstructor
class PickupSlotInitializer {

    private final PickupSlotRepository pickupSlotRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
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
        pickupSlotRepository.saveAndFlush(slot);
    }
}
