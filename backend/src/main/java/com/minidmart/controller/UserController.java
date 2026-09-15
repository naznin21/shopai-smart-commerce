package com.minidmart.controller;

import com.minidmart.dto.ChangeRoleRequest;
import com.minidmart.dto.UpdateProfileRequest;
import com.minidmart.dto.UserProfileDto;
import com.minidmart.dto.UserSummaryDto;
import com.minidmart.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getCurrentUserProfile() {
        return ResponseEntity.ok(userService.getCurrentUserProfile());
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileDto> updateCurrentUserProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            HttpServletRequest servletRequest) {
        String ipAddress = servletRequest.getRemoteAddr();
        return ResponseEntity.ok(userService.updateCurrentUserProfile(request, ipAddress));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<UserSummaryDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserSummaryDto> updateUserRole(
            @PathVariable String id,
            @Valid @RequestBody ChangeRoleRequest request,
            HttpServletRequest servletRequest) {
        String ipAddress = servletRequest.getRemoteAddr();
        return ResponseEntity.ok(userService.updateUserRole(id, request, ipAddress));
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserSummaryDto> toggleUserStatus(
            @PathVariable String id,
            HttpServletRequest servletRequest) {
        String ipAddress = servletRequest.getRemoteAddr();
        return ResponseEntity.ok(userService.toggleUserStatus(id, ipAddress));
    }
}
