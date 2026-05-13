package com.linkwise.service;

import com.linkwise.dto.RoleDTO;
import com.linkwise.entity.Permission;
import com.linkwise.entity.Role;
import com.linkwise.entity.RolePermission;
import com.linkwise.repository.RolePermissionRepository;
import com.linkwise.repository.RoleRepository;
import com.linkwise.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Role Service
 * Business logic layer for role-related operations
 */
@Service
@RequiredArgsConstructor
@Transactional
public class RoleService {
    
    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PermissionRepository permissionRepository;
    
    /**
     * Get all builtin roles
     */
    @Transactional(readOnly = true)
    public List<RoleDTO> getBuiltinRoles() {
        return roleRepository.findByOrganizationIdIsNull()
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Get roles for organization
     */
    @Transactional(readOnly = true)
    public List<RoleDTO> getRolesForOrganization(Long organizationId) {
        return roleRepository.findByOrganizationIdOrOrganizationIdIsNull(organizationId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Get role by ID
     */
    @Transactional(readOnly = true)
    public RoleDTO getRoleById(Long roleId) {
        return roleRepository.findById(roleId)
            .map(this::convertToDTO)
            .orElse(null);
    }
    
    /**
     * Create custom role
     */
    public Role createRole(Long organizationId, String name, String description) {
        Role role = Role.builder()
            .organizationId(organizationId)
            .name(name)
            .description(description)
            .isBuiltin(false)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        return roleRepository.save(role);
    }
    
    /**
     * Assign permissions to role
     */
    public void assignPermissionsToRole(Long roleId, List<Long> permissionIds) {
        // Delete existing permissions
        rolePermissionRepository.deleteByRoleId(roleId);
        
        // Add new permissions
        for (Long permissionId : permissionIds) {
            RolePermission rolePermission = RolePermission.builder()
                .roleId(roleId)
                .permissionId(permissionId)
                .build();
            rolePermissionRepository.save(rolePermission);
        }
    }
    
    /**
     * Get permissions for role
     */
    @Transactional(readOnly = true)
    public List<Permission> getPermissionsForRole(Long roleId) {
        List<RolePermission> rolePermissions = rolePermissionRepository.findByRoleId(roleId);
        return rolePermissions.stream()
            .map(rp -> permissionRepository.findById(rp.getPermissionId()).orElse(null))
            .filter(p -> p != null)
            .collect(Collectors.toList());
    }
    
    /**
     * Convert Role to RoleDTO
     */
    private RoleDTO convertToDTO(Role role) {
        List<String> permissions = getPermissionsForRole(role.getId())
            .stream()
            .map(Permission::getCode)
            .collect(Collectors.toList());
        
        return RoleDTO.builder()
            .id(role.getId())
            .organizationId(role.getOrganizationId())
            .name(role.getName())
            .description(role.getDescription())
            .isBuiltin(role.getIsBuiltin())
            .permissions(permissions)
            .createdAt(role.getCreatedAt())
            .updatedAt(role.getUpdatedAt())
            .build();
    }
}
