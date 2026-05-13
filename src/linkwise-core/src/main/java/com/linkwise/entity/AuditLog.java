package com.linkwise.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Audit Log Entity
 * Records all data modifications for audit trail and compliance
 */
@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_user_id", columnList = "user_id"),
    @Index(name = "idx_audit_entity_type", columnList = "entity_type"),
    @Index(name = "idx_audit_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "entity_type", nullable = false)
    private String entityType; // USER, ROLE, DEPARTMENT, PERMISSION, etc.

    @Column(name = "entity_id", nullable = false)
    private Long entityId;

    @Column(nullable = false)
    private String action; // CREATE, UPDATE, DELETE, ASSIGN, etc.

    @Column(name = "entity_name", length = 255)
    private String entityName; // Name or description of the entity

    @Column(length = 1000)
    private String description; // Human readable description of the change

    @Column(columnDefinition = "TEXT")
    private String oldValues; // JSON format of old values

    @Column(columnDefinition = "TEXT")
    private String newValues; // JSON format of new values

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (organizationId == null) {
            organizationId = 1L; // Default organization
        }
    }
}
