package com.minidmart.controller;

import com.minidmart.dto.CreatePickupSlotRequest;
import com.minidmart.dto.PickupSlotDto;
import com.minidmart.service.PickupSlotService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/pickup-slots")
@RequiredArgsConstructor
public class PickupSlotController {

    private final PickupSlotService pickupSlotService;

    @GetMapping
    public ResponseEntity<List<PickupSlotDto>> getSlotsForDate(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(pickupSlotService.getSlotsForDate(date));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<PickupSlotDto>> getSlotsByDatePath(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(pickupSlotService.getSlotsForDate(date));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<PickupSlotDto>> getUpcomingSlots(
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(pickupSlotService.getUpcomingSlots(days));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<PickupSlotDto> createOrUpdateSlot(
            @Valid @RequestBody CreatePickupSlotRequest request,
            HttpServletRequest servletRequest) {
        String ipAddress = servletRequest.getRemoteAddr();
        return new ResponseEntity<>(pickupSlotService.createOrUpdateSlot(request, ipAddress), HttpStatus.CREATED);
    }
}
