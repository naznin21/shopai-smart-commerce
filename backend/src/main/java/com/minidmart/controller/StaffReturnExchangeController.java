package com.minidmart.controller;

import com.minidmart.dto.ProcessReturnRequest;
import com.minidmart.dto.ReturnExchangeRequestDto;
import com.minidmart.enums.ReturnStatus;
import com.minidmart.service.ReturnExchangeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff/returns")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
public class StaffReturnExchangeController {

    private final ReturnExchangeService returnExchangeService;

    @GetMapping
    public ResponseEntity<List<ReturnExchangeRequestDto>> getAllRequests(
            @RequestParam(required = false) ReturnStatus status) {
        if (status != null) {
            return ResponseEntity.ok(returnExchangeService.getRequestsByStatus(status));
        }
        return ResponseEntity.ok(returnExchangeService.getAllRequests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReturnExchangeRequestDto> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(returnExchangeService.getRequestById(id));
    }

    @PatchMapping("/{id}/process")
    public ResponseEntity<ReturnExchangeRequestDto> processRequest(
            @PathVariable Long id,
            @Valid @RequestBody ProcessReturnRequest request,
            HttpServletRequest servletRequest) {
        String ipAddress = servletRequest.getRemoteAddr();
        return ResponseEntity.ok(returnExchangeService.processRequest(id, request, ipAddress));
    }
}
