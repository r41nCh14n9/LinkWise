package com.linkwise.entity;

/**
 * User Status Enumeration
 */
public enum UserStatus {
    ACTIVE("Active"),
    DISABLED("Disabled"),
    PENDING_ACTIVATION("Pending Activation");

    private final String displayName;

    UserStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
