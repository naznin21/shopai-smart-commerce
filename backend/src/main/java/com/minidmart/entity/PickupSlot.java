package com.minidmart.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "pickup_slots")
@CompoundIndex(def = "{'slotDate': 1, 'timeSlot': 1}", unique = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PickupSlot {

    @Id
    private String id;

    private LocalDate slotDate;

    private String timeSlot; // e.g. "10:00 - 11:00", "11:00 - 12:00", etc.

    @Builder.Default
    private Integer maxCapacity = 10;

    @Builder.Default
    private Integer bookedCount = 0;

    public boolean isAvailable() {
        return bookedCount < maxCapacity;
    }

    public int getAvailableSlots() {
        return Math.max(0, maxCapacity - bookedCount);
    }
}
