package com.minidmart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PickupSlotDto {
    private Long id;
    private LocalDate slotDate;
    private String timeSlot;
    private Integer maxCapacity;
    private Integer bookedCount;
    private Integer availableSlots;
    private boolean isAvailable;
    private String statusText; // e.g., "7 / 10 slots available" or "Fully booked"
}
