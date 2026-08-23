package com.minidmart.util;

import com.minidmart.exception.UnauthorizedException;
import com.minidmart.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static UserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof UserPrincipal)) {
            throw new UnauthorizedException("User is not authenticated");
        }
        return (UserPrincipal) authentication.getPrincipal();
    }

    public static String getCurrentUserEmail() {
        return getCurrentUser().getEmail();
    }

    public static Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public static boolean isStaffOrAbove() {
        UserPrincipal user = getCurrentUser();
        return switch (user.getRole()) {
            case STAFF, MANAGER, ADMIN -> true;
            default -> false;
        };
    }

    public static boolean isManagerOrAdmin() {
        UserPrincipal user = getCurrentUser();
        return switch (user.getRole()) {
            case MANAGER, ADMIN -> true;
            default -> false;
        };
    }

    public static boolean isAdmin() {
        return getCurrentUser().getRole() == com.minidmart.enums.Role.ADMIN;
    }
}
