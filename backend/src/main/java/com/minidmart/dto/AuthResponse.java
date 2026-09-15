package com.minidmart.dto;

import com.minidmart.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    @Builder.Default
    private String tokenType = "Bearer";
    private String id;
    private String name;
    private String email;
    private Role role;
    private String phone;
    private String address;
}
