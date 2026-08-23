package com.minidmart.controller;

import com.minidmart.dto.CustomerDashboardDto;
import com.minidmart.dto.ManagerAdminDashboardDto;
import com.minidmart.dto.StaffDashboardDto;
import com.minidmart.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/customer")
    public ResponseEntity<CustomerDashboardDto> getCustomerDashboard() {
        return ResponseEntity.ok(dashboardService.getCustomerDashboard());
    }

    @GetMapping("/staff")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<StaffDashboardDto> getStaffDashboard() {
        return ResponseEntity.ok(dashboardService.getStaffDashboard());
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ManagerAdminDashboardDto> getManagerAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getManagerAdminDashboard());
    }
}
