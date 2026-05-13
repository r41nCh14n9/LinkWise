package com.linkwise.service;

import com.linkwise.dto.UserDTO;
import com.linkwise.entity.User;
import com.linkwise.entity.UserStatus;
import com.linkwise.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Authentication Service - Handles user authentication
 */
@Slf4j
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Authenticate user with email and password
     * @return UserDTO with roles and permissions if authentication successful, null otherwise
     */
    public UserDTO authenticate(String email, String password) {
        try {
            // Find user by email (check both with and without organization)
            User user = userRepository.findByEmail(email).orElse(null);
            
            if (user == null) {
                log.warn("User not found: {}", email);
                return null;
            }

            // Check if user is active
            log.debug("User found: {}, status: {}, active: {}", email, user.getStatus(), user.getActive());
            
            if (!user.getActive()) {
                log.warn("User account is not active: {}", email);
                return null;
            }
            
            if (user.getStatus() != null && user.getStatus() == UserStatus.DISABLED) {
                log.warn("User account is disabled: {}", email);
                return null;
            }

            // Verify password
            if (!passwordEncoder.matches(password, user.getPassword())) {
                log.warn("Invalid password for user: {}", email);
                return null;
            }

            // Convert to DTO with roles and permissions
            UserDTO userDTO = userService.convertToDTO(user);
            log.info("User authenticated successfully: {}", email);
            
            return userDTO;
            
        } catch (Exception e) {
            log.error("Authentication error for email: " + email, e);
            return null;
        }
    }

    /**
     * Get user information with current roles and permissions
     */
    public UserDTO getUserInfo(Long userId, Long orgId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            
            if (user == null) {
                return null;
            }

            // Verify user belongs to the organization
            if (!user.getOrganizationId().equals(orgId)) {
                log.warn("User {} does not belong to organization {}", userId, orgId);
                return null;
            }

            return userService.convertToDTO(user);
            
        } catch (Exception e) {
            log.error("Error getting user info for ID: " + userId, e);
            return null;
        }
    }
}
