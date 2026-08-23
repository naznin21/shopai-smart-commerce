package com.minidmart.service;

import com.minidmart.dto.ChangeRoleRequest;
import com.minidmart.dto.UpdateProfileRequest;
import com.minidmart.dto.UserProfileDto;
import com.minidmart.dto.UserSummaryDto;
import com.minidmart.entity.User;
import com.minidmart.enums.AuditAction;
import com.minidmart.enums.Role;
import com.minidmart.exception.BadRequestException;
import com.minidmart.exception.ResourceNotFoundException;
import com.minidmart.repository.UserRepository;
import com.minidmart.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public UserProfileDto getCurrentUserProfile() {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToProfileDto(user);
    }

    @Transactional
    public UserProfileDto updateCurrentUserProfile(UpdateProfileRequest request, String ipAddress) {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setName(request.getName().trim());
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim());
        }

        // Optional Password Update
        if (StringUtils.hasText(request.getCurrentPassword()) || StringUtils.hasText(request.getNewPassword())) {
            if (!StringUtils.hasText(request.getCurrentPassword()) || !StringUtils.hasText(request.getNewPassword())) {
                throw new BadRequestException("Both current and new password are required to change password");
            }

            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new BadRequestException("Current password does not match");
            }

            if (request.getNewPassword().length() < 6) {
                throw new BadRequestException("New password must be at least 6 characters");
            }

            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        User updatedUser = userRepository.save(user);

        auditLogService.log(
                user.getEmail(),
                AuditAction.USER_UPDATE,
                "USER",
                String.valueOf(user.getId()),
                "User updated profile details",
                ipAddress
        );

        return mapToProfileDto(updatedUser);
    }

    @Transactional(readOnly = true)
    public List<UserSummaryDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToSummaryDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserSummaryDto updateUserRole(Long userId, ChangeRoleRequest request, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Role oldRole = user.getRole();
        user.setRole(request.getRole());
        User updatedUser = userRepository.save(user);

        auditLogService.log(
                SecurityUtils.getCurrentUserEmail(),
                AuditAction.ROLE_CHANGE,
                "USER",
                String.valueOf(user.getId()),
                String.format("Changed role for %s from %s to %s", user.getEmail(), oldRole, request.getRole()),
                ipAddress
        );

        return mapToSummaryDto(updatedUser);
    }

    @Transactional
    public UserSummaryDto toggleUserStatus(Long userId, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setActive(!user.isActive());
        User updatedUser = userRepository.save(user);

        auditLogService.log(
                SecurityUtils.getCurrentUserEmail(),
                AuditAction.USER_UPDATE,
                "USER",
                String.valueOf(user.getId()),
                String.format("User %s active status changed to %b", user.getEmail(), user.isActive()),
                ipAddress
        );

        return mapToSummaryDto(updatedUser);
    }

    private UserProfileDto mapToProfileDto(User user) {
        return UserProfileDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .address(user.getAddress())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private UserSummaryDto mapToSummaryDto(User user) {
        return UserSummaryDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
