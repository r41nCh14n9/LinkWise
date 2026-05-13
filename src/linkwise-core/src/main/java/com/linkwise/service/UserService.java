package com.linkwise.service;

import com.linkwise.dto.CreateUserRequest;
import com.linkwise.dto.UserDTO;
import com.linkwise.entity.User;
import com.linkwise.entity.UserStatus;
import com.linkwise.entity.UserRoleAssignment;
import com.linkwise.repository.UserRepository;
import com.linkwise.repository.UserRoleAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Enhanced User Service
 * Business logic layer for user-related operations with audit logging
 */
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    private final UserRoleAssignmentRepository userRoleRepository;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    
    /**
     * Create a new user
     */
    public User createUser(CreateUserRequest request, Long organizationId) {
        // Validate email not in use
        if (userRepository.existsByEmailAndOrganizationId(request.getEmail(), organizationId)) {
            throw new IllegalArgumentException("Email already in use: " + request.getEmail());
        }
        
        User user = User.builder()
            .email(request.getEmail())
            .username(request.getUsername())
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .password(passwordEncoder.encode(request.getPassword()))
            .organizationId(organizationId)
            .departmentId(request.getDepartmentId())
            .status(UserStatus.ACTIVE)
            .active(true)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        
        User savedUser = userRepository.save(user);
        
        // Log audit - created by system (userId = 1 for system actions)
        auditLogService.logAction(
            1L, // System user
            "USER",
            savedUser.getId(),
            "CREATE",
            savedUser.getEmail(),
            "User created: " + savedUser.getFirstName() + " " + savedUser.getLastName(),
            organizationId
        );
        
        // Assign roles if provided
        if (request.getRoleIds() != null && !request.getRoleIds().isEmpty()) {
            assignRolesToUser(savedUser.getId(), request.getRoleIds());
        }
        
        return savedUser;
    }
    
    /**
     * Get user by ID
     */
    @Transactional(readOnly = true)
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    /**
     * Get user by email
     */
    @Transactional(readOnly = true)
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    /**
     * Get all users in organization
     */
    @Transactional(readOnly = true)
    public List<User> getUsersByOrganization(Long organizationId) {
        return userRepository.findByOrganizationId(organizationId);
    }
    
    /**
     * Get users by department
     */
    @Transactional(readOnly = true)
    public List<User> getUsersByDepartment(Long departmentId) {
        return userRepository.findByDepartmentId(departmentId);
    }
    
    /**
     * Get all active users
     */
    @Transactional(readOnly = true)
    public List<User> getActiveUsers() {
        return userRepository.findByActiveTrue();
    }
    
    /**
     * Search users by email in organization
     */
    @Transactional(readOnly = true)
    public List<User> searchUsers(Long organizationId, String searchTerm) {
        return userRepository.searchByEmailInOrganization(organizationId, searchTerm);
    }
    
    /**
     * Update user information
     */
    public User updateUser(Long id, String username, String firstName, String lastName, Long departmentId) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        
        // Keep track of old values for audit
        String oldUsername = user.getUsername();
        String oldFirstName = user.getFirstName();
        String oldLastName = user.getLastName();
        Long oldDepartmentId = user.getDepartmentId();
        
        if (username != null) user.setUsername(username);
        if (firstName != null) user.setFirstName(firstName);
        if (lastName != null) user.setLastName(lastName);
        if (departmentId != null) user.setDepartmentId(departmentId);
        user.setUpdatedAt(LocalDateTime.now());
        
        User updatedUser = userRepository.save(user);
        
        // Log audit
        auditLogService.logAction(
            1L, // System user
            "USER",
            id,
            "UPDATE",
            updatedUser.getEmail(),
            String.format("User updated - Name: %s %s", updatedUser.getFirstName(), updatedUser.getLastName()),
            user.getOrganizationId()
        );
        
        return updatedUser;
    }
    
    /**
     * Disable user (soft delete)
     */
    public User disableUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        
        user.setActive(false);
        user.setStatus(UserStatus.DISABLED);
        user.setUpdatedAt(LocalDateTime.now());
        
        User disabledUser = userRepository.save(user);
        
        // Log audit
        auditLogService.logAction(
            1L, // System user
            "USER",
            id,
            "DISABLE",
            user.getEmail(),
            "User disabled",
            user.getOrganizationId()
        );
        
        return disabledUser;
    }
    
    /**
     * Delete user
     */
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        
        // Log audit before deletion
        auditLogService.logAction(
            1L, // System user
            "USER",
            id,
            "DELETE",
            user.getEmail(),
            "User deleted",
            user.getOrganizationId()
        );
        
        // Delete user role assignments
        userRoleRepository.deleteByUserId(id);
        
        // Delete user
        userRepository.delete(user);
    }
    
    /**
     * Assign roles to user
     */
    public void assignRolesToUser(Long userId, List<Long> roleIds) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        // Delete existing roles
        userRoleRepository.deleteByUserId(userId);
        
        // Assign new roles
        for (Long roleId : roleIds) {
            UserRoleAssignment assignment = UserRoleAssignment.builder()
                .userId(userId)
                .roleId(roleId)
                .build();
            userRoleRepository.save(assignment);
        }
        
        // Log audit
        auditLogService.logAction(
            1L, // System user
            "USER_ROLE",
            userId,
            "ASSIGN",
            user.getEmail(),
            String.format("Assigned %d role(s) to user", roleIds.size()),
            user.getOrganizationId()
        );
    }
    
    /**
     * Get user roles
     */
    @Transactional(readOnly = true)
    public List<Long> getUserRoles(Long userId) {
        return userRoleRepository.findByUserId(userId)
            .stream()
            .map(UserRoleAssignment::getRoleId)
            .collect(Collectors.toList());
    }
    
    /**
     * Convert User to UserDTO with roles and permissions loaded
     */
    public UserDTO convertToDTO(User user) {
        // Get user's role IDs
        List<Long> roleIds = userRoleRepository.findByUserId(user.getId())
            .stream()
            .map(UserRoleAssignment::getRoleId)
            .collect(Collectors.toList());
        
        // Get role names and collect permissions
        List<String> roleNames = new java.util.ArrayList<>();
        List<String> permissionsList = new java.util.ArrayList<>();
        
        for (Long roleId : roleIds) {
            // Get role by ID
            var role = roleService.getRoleById(roleId);
            if (role != null) {
                roleNames.add(role.getName());
                // Add all permissions from this role
                if (role.getPermissions() != null) {
                    permissionsList.addAll(role.getPermissions());
                }
            }
        }
        
        return UserDTO.builder()
            .id(user.getId())
            .email(user.getEmail())
            .username(user.getUsername())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .status(user.getStatus())
            .organizationId(user.getOrganizationId())
            .departmentId(user.getDepartmentId())
            .roles(roleNames.isEmpty() ? null : roleNames)
            .permissions(permissionsList.isEmpty() ? null : permissionsList)
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }
}
