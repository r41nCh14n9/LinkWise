package com.linkwise.controller;

import com.linkwise.entity.User;
import com.linkwise.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User createdUser = userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    /**
     * Get all users
     */
    @GetMapping
    @Operation(summary = "Get all users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Get active users only
     */
    @GetMapping("/active")
    @Operation(summary = "Get all active users")
    public ResponseEntity<List<User>> getActiveUsers() {
        List<User> activeUsers = userService.getActiveUsers();
        return ResponseEntity.ok(activeUsers);
    }

    /**
     * Get a user by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get a user by ID")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Get a user by email
     */
    @GetMapping("/email/{email}")
    @Operation(summary = "Get a user by email")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        return userService.getUserByEmail(email)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Update a user
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update a user")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        User updatedUser = userService.updateUser(id, userDetails);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Delete a user
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a user")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    @Operation(summary = "Health check")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Backend service is running");
    }
}
