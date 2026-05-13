package com.linkwise.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Permission Entity
 * Represents a permission in the RBAC system
 */
@Entity
@Table(name = "permissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String code;
    
    @Column(nullable = false)
    private String module;
    
    @Column(nullable = false)
    private String feature;
    
    @Column(length = 500)
    private String description;
    
    @Column(name = "data_level")
    private String dataLevel; // ENTERPRISE, DEPARTMENT, PERSONAL, RESTRICTED
    
    @Column(nullable = false)
    private String operation; // CREATE, READ, UPDATE, DELETE
}
