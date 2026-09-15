package com.minidmart.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    private String id;
    private LocalDate slotDate;
    private String timeSlot;
    private Integer maxCapacity;
    private Integer bookedCount;
    private Integer availableSlots;

    @JsonProperty("isAvailable")
    private boolean available;

    private String statusText; // e.g., "7 / 10 slots available" or "Fully booked"

    @JsonProperty("available")
    public boolean getAvailableAlias() {
        return available;
    }
}