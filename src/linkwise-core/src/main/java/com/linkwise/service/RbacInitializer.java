package com.linkwise.service;

import com.linkwise.entity.Permission;
import com.linkwise.entity.Role;
import com.linkwise.entity.RolePermission;
import com.linkwise.repository.PermissionRepository;
import com.linkwise.repository.RoleRepository;
import com.linkwise.repository.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * Initialize RBAC system with default permissions and roles
 */
@Component
@RequiredArgsConstructor
public class RbacInitializer implements CommandLineRunner {
    
    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    
    @Override
    public void run(String... args) throws Exception {
        initializePermissions();
        initializeBuiltinRoles();
    }
    
    private void initializePermissions() {
        // Skip if permissions already exist
        if (permissionRepository.count() > 0) {
            return;
        }
        
        // User Management Permissions
        createPermission("USER_CREATE", "RBAC", "User Management", "Create new users", "ENTERPRISE", "CREATE");
        createPermission("USER_READ", "RBAC", "User Management", "View user information", "ENTERPRISE", "READ");
        createPermission("USER_UPDATE", "RBAC", "User Management", "Edit user information", "ENTERPRISE", "UPDATE");
        createPermission("USER_DELETE", "RBAC", "User Management", "Delete users", "ENTERPRISE", "DELETE");
        
        // Role Management Permissions
        createPermission("ROLE_CREATE", "RBAC", "Role Management", "Create roles", "ENTERPRISE", "CREATE");
        createPermission("ROLE_READ", "RBAC", "Role Management", "View roles", "ENTERPRISE", "READ");
        createPermission("ROLE_UPDATE", "RBAC", "Role Management", "Edit roles", "ENTERPRISE", "UPDATE");
        createPermission("ROLE_DELETE", "RBAC", "Role Management", "Delete roles", "ENTERPRISE", "DELETE");
        
        // Department Management Permissions
        createPermission("DEPT_CREATE", "RBAC", "Department Management", "Create departments", "ENTERPRISE", "CREATE");
        createPermission("DEPT_READ", "RBAC", "Department Management", "View departments", "ENTERPRISE", "READ");
        createPermission("DEPT_UPDATE", "RBAC", "Department Management", "Edit departments", "ENTERPRISE", "UPDATE");
        createPermission("DEPT_DELETE", "RBAC", "Department Management", "Delete departments", "ENTERPRISE", "DELETE");
        
        // Dashboard Permissions
        createPermission("DASHBOARD_VIEW", "Dashboard", "Dashboard", "View dashboard", "ENTERPRISE", "READ");
        createPermission("DASHBOARD_EXPORT", "Dashboard", "Dashboard Export", "Export dashboard data", "ENTERPRISE", "READ");
        
        // Purchase Request Permissions
        createPermission("PR_CREATE", "Procurement", "Purchase Request", "Create PR", "DEPARTMENT", "CREATE");
        createPermission("PR_READ", "Procurement", "Purchase Request", "View PR", "DEPARTMENT", "READ");
        createPermission("PR_APPROVE", "Procurement", "Purchase Request", "Approve PR", "DEPARTMENT", "UPDATE");
        createPermission("PR_DELETE", "Procurement", "Purchase Request", "Delete PR", "PERSONAL", "DELETE");
        
        // Vendor Management Permissions
        createPermission("VENDOR_CREATE", "VMS", "Vendor Management", "Create vendors", "ENTERPRISE", "CREATE");
        createPermission("VENDOR_READ", "VMS", "Vendor Management", "View vendors", "ENTERPRISE", "READ");
        createPermission("VENDOR_UPDATE", "VMS", "Vendor Management", "Edit vendors", "ENTERPRISE", "UPDATE");
        createPermission("VENDOR_DELETE", "VMS", "Vendor Management", "Delete vendors", "ENTERPRISE", "DELETE");
    }
    
    private void initializeBuiltinRoles() {
        // Skip if roles already exist
        if (roleRepository.count() > 0) {
            return;
        }
        
        // Admin Role - All permissions
        Role adminRole = createRole(null, "ADMIN", "System Administrator", true);
        List<Permission> allPermissions = permissionRepository.findAll();
        for (Permission permission : allPermissions) {
            RolePermission rolePermission = RolePermission.builder()
                .roleId(adminRole.getId())
                .permissionId(permission.getId())
                .build();
            rolePermissionRepository.save(rolePermission);
        }
        
        // Approver Role - Approval and view permissions
        Role approverRole = createRole(null, "APPROVER", "Approver", true);
        assignPermissionsToRole(approverRole, Arrays.asList(
            "DASHBOARD_VIEW", "PR_READ", "PR_APPROVE", "VENDOR_READ"
        ));
        
        // Buyer Role - Creation and reading permissions
        Role buyerRole = createRole(null, "BUYER", "Buyer", true);
        assignPermissionsToRole(buyerRole, Arrays.asList(
            "DASHBOARD_VIEW", "PR_CREATE", "PR_READ", "PR_DELETE", "VENDOR_READ", "VENDOR_UPDATE"
        ));
        
        // Requester Role - Basic permissions
        Role requesterRole = createRole(null, "REQUESTER", "Requester", true);
        assignPermissionsToRole(requesterRole, Arrays.asList(
            "DASHBOARD_VIEW", "PR_CREATE", "PR_READ"
        ));
    }
    
    private Permission createPermission(String code, String module, String feature, 
                                       String description, String dataLevel, String operation) {
        Permission permission = Permission.builder()
            .code(code)
            .module(module)
            .feature(feature)
            .description(description)
            .dataLevel(dataLevel)
            .operation(operation)
            .build();
        return permissionRepository.save(permission);
    }
    
    private Role createRole(Long organizationId, String name, String description, Boolean isBuiltin) {
        Role role = Role.builder()
            .organizationId(organizationId)
            .name(name)
            .description(description)
            .isBuiltin(isBuiltin)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        return roleRepository.save(role);
    }
    
    private void assignPermissionsToRole(Role role, List<String> permissionCodes) {
        for (String code : permissionCodes) {
            Permission permission = permissionRepository.findByCode(code).orElse(null);
            if (permission != null) {
                RolePermission rolePermission = RolePermission.builder()
                    .roleId(role.getId())
                    .permissionId(permission.getId())
                    .build();
                rolePermissionRepository.save(rolePermission);
            }
        }
    }
}
