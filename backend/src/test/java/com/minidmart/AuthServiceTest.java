package com.minidmart;

import com.minidmart.dto.AuthResponse;
import com.minidmart.dto.LoginRequest;
import com.minidmart.dto.RegisterRequest;
import com.minidmart.entity.Cart;
import com.minidmart.entity.User;
import com.minidmart.enums.Role;
import com.minidmart.exception.ConflictException;
import com.minidmart.exception.UnauthorizedException;
import com.minidmart.repository.CartRepository;
import com.minidmart.repository.UserRepository;
import com.minidmart.security.JwtTokenProvider;
import com.minidmart.service.AuditLogService;
import com.minidmart.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .name("Alice Smith")
                .email("alice@example.com")
                .password("Password@123")
                .phone("+91 9999988888")
                .address("123 Green Valley")
                .build();

        loginRequest = LoginRequest.builder()
                .email("alice@example.com")
                .password("Password@123")
                .build();
    }

    @Test
    void testRegister_Success() {
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password@123")).thenReturn("encodedPassword");

        User savedUser = User.builder()
                .id("user1")
                .name("Alice Smith")
                .email("alice@example.com")
                .password("encodedPassword")
                .role(Role.CUSTOMER)
                .active(true)
                .build();

        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(tokenProvider.generateTokenFromEmail(eq("alice@example.com"), eq("CUSTOMER"))).thenReturn("mockJwtToken");

        AuthResponse response = authService.register(registerRequest, "127.0.0.1");

        assertNotNull(response);
        assertEquals("alice@example.com", response.getEmail());
        assertEquals("mockJwtToken", response.getToken());
        assertEquals(Role.CUSTOMER, response.getRole());
        verify(cartRepository, times(1)).save(any(Cart.class));
    }

    @Test
    void testRegister_DuplicateEmail_ThrowsConflictException() {
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.register(registerRequest, "127.0.0.1"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testLogin_Success() {
        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);

        User user = User.builder()
                .id("user1")
                .name("Alice Smith")
                .email("alice@example.com")
                .password("encodedPassword")
                .role(Role.CUSTOMER)
                .active(true)
                .build();

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(tokenProvider.generateToken(auth)).thenReturn("mockJwtToken");

        AuthResponse response = authService.login(loginRequest, "127.0.0.1");

        assertNotNull(response);
        assertEquals("mockJwtToken", response.getToken());
        assertEquals("alice@example.com", response.getEmail());
    }

    @Test
    void testLogin_BadCredentials_ThrowsUnauthorizedException() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(UnauthorizedException.class, () -> authService.login(loginRequest, "127.0.0.1"));
    }
}
