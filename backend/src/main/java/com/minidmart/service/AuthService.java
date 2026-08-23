package com.minidmart.service;

import com.minidmart.dto.AuthResponse;
import com.minidmart.dto.LoginRequest;
import com.minidmart.dto.RegisterRequest;
import com.minidmart.entity.Cart;
import com.minidmart.entity.User;
import com.minidmart.enums.AuditAction;
import com.minidmart.enums.Role;
import com.minidmart.exception.BadRequestException;
import com.minidmart.exception.ConflictException;
import com.minidmart.exception.UnauthorizedException;
import com.minidmart.repository.CartRepository;
import com.minidmart.repository.UserRepository;
import com.minidmart.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final AuditLogService auditLogService;

    @Transactional
    public AuthResponse register(RegisterRequest request, String ipAddress) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ConflictException("An account with email " + normalizedEmail + " already exists");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .address(request.getAddress() != null ? request.getAddress().trim() : null)
                .role(Role.CUSTOMER)
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        // Create empty Cart for new user
        Cart cart = Cart.builder()
                .user(savedUser)
                .build();
        cartRepository.save(cart);

        String token = tokenProvider.generateTokenFromEmail(savedUser.getEmail(), savedUser.getRole().name());

        auditLogService.log(
                savedUser.getEmail(),
                AuditAction.USER_REGISTER,
                "USER",
                String.valueOf(savedUser.getId()),
                "User self-registered as CUSTOMER",
                ipAddress
        );

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .phone(savedUser.getPhone())
                .address(savedUser.getAddress())
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request, String ipAddress) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
            );

            User user = userRepository.findByEmail(normalizedEmail)
                    .orElseThrow(() -> new UnauthorizedException("User not found"));

            if (!user.isActive()) {
                throw new UnauthorizedException("Account is disabled. Please contact customer support.");
            }

            String token = tokenProvider.generateToken(authentication);

            auditLogService.log(
                    user.getEmail(),
                    AuditAction.USER_LOGIN,
                    "USER",
                    String.valueOf(user.getId()),
                    "User successfully authenticated",
                    ipAddress
            );

            return AuthResponse.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .phone(user.getPhone())
                    .address(user.getAddress())
                    .build();

        } catch (BadCredentialsException ex) {
            log.warn("Failed login attempt for email: {}", normalizedEmail);
            throw new UnauthorizedException("Invalid email or password");
        }
    }
}
