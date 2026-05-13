package com.linkwise.controller;

import com.linkwise.dto.LoginRequest;
import com.linkwise.dto.LoginResponse;
import com.linkwise.dto.ApiResponse;
import com.linkwise.dto.UserDTO;
import com.linkwise.service.AuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;

/**
 * Authentication Controller - Handles user login and authentication
 * Supports HTTP Basic Auth and credentials-based login
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Login with email and password
     * Returns user info with roles and permissions
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody LoginRequest request) {
        try {
            log.info("Login attempt for email: {}", request.getEmail());
            
            UserDTO user = authService.authenticate(request.getEmail(), request.getPassword());
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse("UNAUTHORIZED", null, "Invalid email or password"));
            }
            
            LoginResponse response = LoginResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .status(user.getStatus().toString())
                .organizationId(user.getOrganizationId())
                .roles(user.getRoles())
                .permissions(user.getPermissions())
                .token(generateToken(user))
                .build();
            
            log.info("Login successful for user: {}", user.getEmail());
            return ResponseEntity.ok(new ApiResponse("SUCCESS", response, "Login successful"));
            
        } catch (Exception e) {
            log.error("Login error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse("ERROR", null, "Login failed: " + e.getMessage()));
        }
    }

    /**
     * Parse HTTP Basic Auth credentials from Authorization header
     * Format: Basic base64(email:password)
     */
    @PostMapping("/basic-login")
    public ResponseEntity<ApiResponse> basicLogin(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Basic ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse("UNAUTHORIZED", null, "Missing or invalid Authorization header"));
            }

            String base64Credentials = authHeader.substring(6);
            String credentials = new String(Base64.getDecoder().decode(base64Credentials));
            String[] parts = credentials.split(":", 2);
            
            if (parts.length != 2) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse("UNAUTHORIZED", null, "Invalid credential format"));
            }

            String email = parts[0];
            String password = parts[1];

            log.info("HTTP Basic login attempt for email: {}", email);
            
            UserDTO user = authService.authenticate(email, password);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse("UNAUTHORIZED", null, "Invalid credentials"));
            }

            LoginResponse response = LoginResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .status(user.getStatus().toString())
                .organizationId(user.getOrganizationId())
                .roles(user.getRoles())
                .permissions(user.getPermissions())
                .token(generateToken(user))
                .build();
            
            log.info("HTTP Basic login successful for user: {}", user.getEmail());
            return ResponseEntity.ok(new ApiResponse("SUCCESS", response, "Login successful"));
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid Base64 encoding", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse("UNAUTHORIZED", null, "Invalid Base64 encoding"));
        } catch (Exception e) {
            log.error("HTTP Basic login error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse("ERROR", null, "Login failed: " + e.getMessage()));
        }
    }

    /**
     * Get current authenticated user info
     * Can be called after login to refresh user data
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse> getCurrentUser(
            @RequestParam(value = "user_id", required = false) Long userId,
            @RequestParam(value = "org_id", required = true) Long orgId) {
        try {
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse("UNAUTHORIZED", null, "User not authenticated"));
            }

            UserDTO user = authService.getUserInfo(userId, orgId);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse("NOT_FOUND", null, "User not found"));
            }
            
            return ResponseEntity.ok(new ApiResponse("SUCCESS", user, null));
            
        } catch (Exception e) {
            log.error("Error getting current user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse("ERROR", null, "Failed to get user info"));
        }
    }

    /**
     * Logout endpoint (placeholder for future token invalidation)
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout(
            @RequestParam(value = "user_id", required = false) Long userId) {
        try {
            log.info("Logout for user ID: {}", userId);
            return ResponseEntity.ok(new ApiResponse("SUCCESS", null, "Logout successful"));
        } catch (Exception e) {
            log.error("Logout error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse("ERROR", null, "Logout failed"));
        }
    }

    /**
     * Generate a simple token (for development, would use JWT in production)
     */
    private String generateToken(UserDTO user) {
        // For development: use a simple format
        // In production: implement JWT token generation
        return "Bearer_" + user.getId() + "_" + System.currentTimeMillis();
    }
}
