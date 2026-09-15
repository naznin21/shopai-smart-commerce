package com.minidmart.service;

import com.minidmart.dto.CreatePickupSlotRequest;
import com.minidmart.dto.PickupSlotDto;
import com.minidmart.entity.PickupSlot;
import com.minidmart.enums.AuditAction;
import com.minidmart.exception.BadRequestException;
import com.minidmart.exception.ResourceNotFoundException;
import com.minidmart.repository.PickupSlotRepository;
import com.minidmart.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PickupSlotService {

    private final PickupSlotRepository pickupSlotRepository;
    private final AuditLogService auditLogService;
    private final PickupSlotInitializer pickupSlotInitializer;

    @Value("${app.pickup.default-slot-capacity:10}")
    private int defaultCapacity;

    private static final String[] DEFAULT_TIME_SLOTS = {
            "09:00 - 10:00",
            "10:00 - 11:00",
            "11:00 - 12:00",
            "12:00 - 13:00",
            "16:00 - 17:00",
            "17:00 - 18:00",
            "18:00 - 19:00",
            "19:00 - 20:00"
    };

    public List<PickupSlotDto> getSlotsForDate(LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }

        List<PickupSlot> slots = pickupSlotRepository.findBySlotDateOrderByTimeSlotAsc(date);
        if (slots.isEmpty()) {
            for (String timeSlot : DEFAULT_TIME_SLOTS) {
                try {
                    pickupSlotInitializer.createSlotIfAbsent(date, timeSlot, defaultCapacity);
                } catch (Exception e) {
                    log.debug("Slot {} on {} handling: {}", timeSlot, date, e.getMessage());
                }
            }
            slots = pickupSlotRepository.findBySlotDateOrderByTimeSlotAsc(date);
        }

        return slots.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<PickupSlotDto> getUpcomingSlots(int days) {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusDays(Math.max(1, days));
        List<PickupSlotDto> allSlots = new ArrayList<>();

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            allSlots.addAll(getSlotsForDate(date));
        }

        return allSlots;
    }

    public List<PickupSlot> initializeDefaultSlotsForDate(LocalDate date) {
        List<PickupSlot> createdSlots = new ArrayList<>();
        for (String timeSlot : DEFAULT_TIME_SLOTS) {
            Optional<PickupSlot> existing = pickupSlotRepository.findBySlotDateAndTimeSlot(date, timeSlot);
            if (existing.isEmpty()) {
                PickupSlot slot = PickupSlot.builder()
                        .slotDate(date)
                        .timeSlot(timeSlot)
                        .maxCapacity(defaultCapacity)
                        .bookedCount(0)
                        .build();
                createdSlots.add(pickupSlotRepository.save(slot));
            } else {
                createdSlots.add(existing.get());
            }
        }
        return createdSlots;
    }

    public PickupSlot reserveSlot(LocalDate date, String timeSlot) {
        PickupSlot slot = pickupSlotRepository.findBySlotDateAndTimeSlot(date, timeSlot)
                .orElseGet(() -> {
                    PickupSlot newSlot = PickupSlot.builder()
                            .slotDate(date)
                            .timeSlot(timeSlot)
                            .maxCapacity(defaultCapacity)
                            .bookedCount(0)
                            .build();
                    return pickupSlotRepository.save(newSlot);
                });

        if (!slot.isAvailable()) {
            throw new BadRequestException("The selected pickup slot (" + timeSlot + " on " + date + ") is fully booked. Please choose another time slot.");
        }

        slot.setBookedCount(slot.getBookedCount() + 1);
        return pickupSlotRepository.save(slot);
    }

    public void releaseSlot(LocalDate date, String timeSlot) {
        if (date == null || timeSlot == null) return;

        pickupSlotRepository.findBySlotDateAndTimeSlot(date, timeSlot).ifPresent(slot -> {
            if (slot.getBookedCount() > 0) {
                slot.setBookedCount(slot.getBookedCount() - 1);
                pickupSlotRepository.save(slot);
            }
        });
    }

    public PickupSlotDto createOrUpdateSlot(CreatePickupSlotRequest request, String ipAddress) {
        PickupSlot slot = pickupSlotRepository.findBySlotDateAndTimeSlot(request.getSlotDate(), request.getTimeSlot())
                .orElseGet(() -> PickupSlot.builder()
                        .slotDate(request.getSlotDate())
                        .timeSlot(request.getTimeSlot())
                        .bookedCount(0)
                        .build());

        slot.setMaxCapacity(request.getMaxCapacity());
        PickupSlot saved = pickupSlotRepository.save(slot);

        auditLogService.log(
                SecurityUtils.getCurrentUserEmail(),
                AuditAction.PRODUCT_UPDATE,
                "PICKUP_SLOT",
                saved.getId(),
                "Configured pickup slot capacity: " + saved.getTimeSlot() + " on " + saved.getSlotDate() + " to " + saved.getMaxCapacity(),
                ipAddress
        );

        return mapToDto(saved);
    }

    public PickupSlotDto mapToDto(PickupSlot slot) {
        if (slot == null) return null;
        int available = slot.getAvailableSlots();
        boolean isAvail = slot.isAvailable();
        String statusText = isAvail
                ? String.format("%d / %d slots available", available, slot.getMaxCapacity())
                : "Fully booked";

        return PickupSlotDto.builder()
                .id(slot.getId())
                .slotDate(slot.getSlotDate())
                .timeSlot(slot.getTimeSlot())
                .maxCapacity(slot.getMaxCapacity())
                .bookedCount(slot.getBookedCount())
                .availableSlots(available)
                .available(isAvail)
                .statusText(statusText)
                .build();
    }
}