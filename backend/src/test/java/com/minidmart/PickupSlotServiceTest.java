package com.minidmart;

import com.minidmart.entity.PickupSlot;
import com.minidmart.exception.BadRequestException;
import com.minidmart.repository.PickupSlotRepository;
import com.minidmart.service.AuditLogService;
import com.minidmart.service.PickupSlotService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PickupSlotServiceTest {

    @Mock
    private PickupSlotRepository pickupSlotRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private PickupSlotService pickupSlotService;

    private LocalDate today;

    @BeforeEach
    void setUp() {
        today = LocalDate.now();
        ReflectionTestUtils.setField(pickupSlotService, "defaultCapacity", 10);
    }

    @Test
    void testReserveSlot_Success() {
        PickupSlot slot = PickupSlot.builder()
                .id("slot1")
                .slotDate(today)
                .timeSlot("10:00 - 11:00")
                .maxCapacity(10)
                .bookedCount(5)
                .build();

        when(pickupSlotRepository.findBySlotDateAndTimeSlot(today, "10:00 - 11:00"))
                .thenReturn(Optional.of(slot));
        when(pickupSlotRepository.save(any(PickupSlot.class))).thenAnswer(i -> i.getArgument(0));

        PickupSlot reserved = pickupSlotService.reserveSlot(today, "10:00 - 11:00");

        assertEquals(6, reserved.getBookedCount());
        assertTrue(reserved.isAvailable());
    }

    @Test
    void testReserveSlot_FullyBooked_ThrowsBadRequest() {
        PickupSlot fullSlot = PickupSlot.builder()
                .id("slot1")
                .slotDate(today)
                .timeSlot("10:00 - 11:00")
                .maxCapacity(10)
                .bookedCount(10) // Full
                .build();

        when(pickupSlotRepository.findBySlotDateAndTimeSlot(today, "10:00 - 11:00"))
                .thenReturn(Optional.of(fullSlot));

        assertThrows(BadRequestException.class, () -> pickupSlotService.reserveSlot(today, "10:00 - 11:00"));
    }

    @Test
    void testReleaseSlot_DecrementsBookedCount() {
        PickupSlot slot = PickupSlot.builder()
                .id("slot1")
                .slotDate(today)
                .timeSlot("10:00 - 11:00")
                .maxCapacity(10)
                .bookedCount(5)
                .build();

        when(pickupSlotRepository.findBySlotDateAndTimeSlot(today, "10:00 - 11:00"))
                .thenReturn(Optional.of(slot));

        pickupSlotService.releaseSlot(today, "10:00 - 11:00");

        assertEquals(4, slot.getBookedCount());
        verify(pickupSlotRepository, times(1)).save(slot);
    }
}
