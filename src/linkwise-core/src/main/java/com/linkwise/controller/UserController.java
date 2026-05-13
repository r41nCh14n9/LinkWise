package com.linkwise.controller;

import com.linkwise.dto.CreateUserRequest;
import com.linkwise.dto.UserDTO;
import com.linkwise.entity.User;
import com.linkwise.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * User Controller
 * 
 * REST API endpoints for user management.
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management APIs")
public class UserController {

    private final UserService userService;

    /**
     * Create a new user
     */
    @PostMapping
    @Operation(summary = "Create a new user")
    public ResponseEntity<Map<String, Object>> createUser(
            @RequestBody CreateUserRequest request,
            @RequestParam(value = "org_id", required = true) Long organizationId) {
        User createdUser = userService.createUser(request, organizationId);
        UserDTO userDTO = userService.convertToDTO(createdUser);
        
        Map<String, Object> response = new HashMap<>();
        response.put("code", "CREATED");
        response.put("data", userDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all users in organization
     */
    @GetMapping
    @Operation(summary = "Get all users in organization")
    public ResponseEntity<Map<String, Object>> getAllUsers(
            @RequestParam(value = "org_id", required = true) Long organizationId,
            @RequestParam(value = "department_id", required = false) Long departmentId,
            @RequestParam(value = "search", required = false) String searchTerm) {
        
        List<User> users;
        if (departmentId != null) {
            users = userService.getUsersByDepartment(departmentId);
        } else if (searchTerm != null && !searchTerm.isEmpty()) {
            users = userService.searchUsers(organizationId, searchTerm);
        } else {
            users = userService.getUsersByOrganization(organizationId);
        }
        
        List<UserDTO> userDTOs = users.stream()
            .map(userService::convertToDTO)
            .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("code", "SUCCESS");
        response.put("data", userDTOs);
        return ResponseEntity.ok(response);
    }

    /**
     * Get active users only
     */
    @GetMapping("/active")
    @Operation(summary = "Get all active users")
    public ResponseEntity<Map<String, Object>> getActiveUsers() {
        List<User> users = userService.getActiveUsers();
        List<UserDTO> userDTOs = users.stream()
            .map(userService::convertToDTO)
            .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("code", "SUCCESS");
        response.put("data", userDTOs);
        return ResponseEntity.ok(response);
    }

    /**
     * Get user by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id)
            .orElse(null);
        
        if (user == null) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", "NOT_FOUND");
            errorResponse.put("message", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
        
        UserDTO userDTO = userService.convertToDTO(user);
        Map<String, Object> response = new HashMap<>();
        response.put("code", "SUCCESS");
        response.put("data", userDTO);
        return ResponseEntity.ok(response);
    }

    /**
     * Update user information
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update user information")
    public ResponseEntity<Map<String, Object>> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        
        String username = (String) request.get("username");
        String firstName = (String) request.get("first_name");
        String lastName = (String) request.get("last_name");
        Long departmentId = request.get("department_id") != null ? 
            ((Number) request.get("department_id")).longValue() : null;
        
        User user = userService.updateUser(id, username, firstName, lastName, departmentId);
        UserDTO userDTO = userService.convertToDTO(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("code", "SUCCESS");
        response.put("data", userDTO);
        return ResponseEntity.ok(response);
    }

    /**
     * Assign roles to user
     */
    @PostMapping("/{id}/roles")
    @Operation(summary = "Assign roles to user")
    public ResponseEntity<Map<String, Object>> assignRoles(
            @PathVariable Long id,
            @RequestBody Map<String, List<Long>> request) {
        
        userService.assignRolesToUser(id, request.get("roleIds"));
        
        Map<String, Object> response = new HashMap<>();
        response.put("code", "SUCCESS");
        response.put("message", "Roles assigned successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Disable user (soft delete)
     */
    @PatchMapping("/{id}/disable")
    @Operation(summary = "Disable user")
    public ResponseEntity<Map<String, Object>> disableUser(@PathVariable Long id) {
        User user = userService.disableUser(id);
        UserDTO userDTO = userService.convertToDTO(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("code", "SUCCESS");
        response.put("message", "User disabled successfully");
        response.put("data", userDTO);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete user
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("code", "SUCCESS");
        response.put("message", "User deleted successfully");
        return ResponseEntity.ok(response);
    }
}
