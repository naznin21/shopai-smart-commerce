package com.minidmart.enums;

public enum Role {
    CUSTOMER,
    STAFF,
    MANAGER,
    ADMIN;

    public String getAuthority() {
        return "ROLE_" + this.name();
    }
}
