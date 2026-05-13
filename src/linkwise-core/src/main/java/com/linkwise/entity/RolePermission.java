package com.linkwise.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * RolePermission Entity
 * Many-to-many relationship between Role and Permission
 */
@Entity
@Table(name = "role_permissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RolePermission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "role_id", nullable = false)
    private Long roleId;
    
    @Column(name = "permission_id", nullable = false)
    private Long permissionId;
}
