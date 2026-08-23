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
    private Long id;
    private LocalDate slotDate;
    private String timeSlot;
    private Integer maxCapacity;
    private Integer bookedCount;
    private Integer availableSlots;

    // Single source of truth for slot availability. Previously this DTO had
    // two separate boolean fields (isAvailable and available) both holding
    // the same value — Lombok's generated getter for "available" collides
    // with Jackson's own derived name for "isAvailable" (Jackson strips the
    // "is" prefix from boolean getters), so Jackson couldn't tell them apart
    // and threw "Conflicting/ambiguous property name definitions" on every
    // response. Now there's one field, exposed under both JSON keys via two
    // distinctly-named accessor methods below, so old and new frontend code
    // reading either "isAvailable" or "available" keeps working.
    @JsonProperty("isAvailable")
    private boolean available;

    private String statusText; // e.g., "7 / 10 slots available" or "Fully booked"

    @JsonProperty("available")
    public boolean getAvailableAlias() {
        return available;
    }
}