package com.minidmart.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "pickup_slots", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"slot_date", "time_slot"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PickupSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "slot_date", nullable = false)
    private LocalDate slotDate;

    @Column(name = "time_slot", nullable = false)
    private String timeSlot; // e.g. "10:00 - 11:00", "11:00 - 12:00", "16:00 - 17:00", "17:00 - 18:00", "18:00 - 19:00"

    @Column(nullable = false)
    @Builder.Default
    private Integer maxCapacity = 10;

    @Column(nullable = false)
    @Builder.Default
    private Integer bookedCount = 0;

    public boolean isAvailable() {
        return bookedCount < maxCapacity;
    }

    public int getAvailableSlots() {
        return Math.max(0, maxCapacity - bookedCount);
    }
}
