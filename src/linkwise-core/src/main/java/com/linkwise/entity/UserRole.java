package com.linkwise.entity;

/**
 * User Role Enumeration
 */
public enum UserRole {
    ADMIN("Administrator", "System administrator with full access"),
    APPROVER("Approver", "Approver with approval permissions"),
    BUYER("Buyer", "Buyer with purchasing permissions"),
    REQUESTER("Requester", "Requester with request creation permissions");

    private final String displayName;
    private final String description;

    UserRole(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
