package com.linkwise.controller;

import com.linkwise.dto.RoleDTO;
import com.linkwise.entity.Permission;
import com.linkwise.service.RoleService;
import com.linkwise.service.PermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Role Controller
 * REST API endpoints for role management
 */
@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
@Tag(name = "Roles", description = "Role and Permission management APIs")
public class RoleController {
    
    private final RoleService roleService;
    private final PermissionService permissionService;
    
    /**
     * Get all builtin roles
     */
    @GetMapping("/builtin")
    @Operation(summary = "Get all builtin roles")
    public ResponseEntity<Map<String, Object>> getBuiltinRoles() {
        List<RoleDTO> roles = roleService.getBuiltinRoles();
        Map<String, Object> response = new HashMap<>();
        response.put("code", "SUCCESS");
        response.put("data", roles);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get roles for organization
     */
    @GetMapping
    @Operation(summary = "Get all roles for organization")
    public ResponseEntity<Map<String, Object>> getRoles(
            @RequestParam(value = "org_id", required = true) Long organizationId) {
        List<RoleDTO> roles = roleService.getRolesForOrganization(organizationId);
        Map<String, Object> response = new HashMap<>();
        response.put("code", "SUCCESS");
        response.put("data", roles);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get role by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get role by ID")
    public ResponseEntity<Map<String, Object>> getRoleById(@PathVariable Long id) {
        RoleDTO role = roleService.getRoleById(id);
        if (role == null) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", "NOT_FOUND");
            errorResponse.put("message", "Role not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
        Map<String, Object> response = new HashMap<>();
        response.put("code", "SUCCESS");
        response.put("data", role);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all permissions
     */
    @GetMapping("/{roleId}/permissions")
    @Operation(summary = "Get permissions for role")
    public ResponseEntity<Map<String, Object>> getRolePermissions(@PathVariable Long roleId) {
        List<Permission> permissions = roleService.getPermissionsForRole(roleId);
        Map<String, Object> response = new HashMap<>();
        response.put("code", "SUCCESS");
        response.put("data", permissions);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Assign permissions to role
     */
    @PostMapping("/{roleId}/permissions")
    @Operation(summary = "Assign permissions to role")
    public ResponseEntity<Map<String, Object>> assignPermissionsToRole(
            @PathVariable Long roleId,
            @RequestBody Map<String, List<String>> request) {
        List<String> permissionCodes = request.get("permissionCodes");
        roleService.assignPermissionsByCode(roleId, permissionCodes);
        Map<String, Object> response = new HashMap<>();
        response.put("code", "SUCCESS");
        response.put("message", "Permissions assigned successfully");
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all permissions in system
     */
    @GetMapping("/system/permissions")
    @Operation(summary = "Get all available permissions")
    public ResponseEntity<Map<String, Object>> getAllPermissions() {
        List<Permission> permissions = permissionService.getAllPermissions();
        Map<String, Object> response = new HashMap<>();
        response.put("code", "SUCCESS");
        response.put("data", permissions);
        return ResponseEntity.ok(response);
    }
}
