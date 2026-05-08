package com.linkwise.service;

import com.linkwise.entity.User;
import com.linkwise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * User Service
 * 
 * Business logic layer for user-related operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;

    /**
     * Create a new user
     * 
     * @param user the user to create
     * @return the created user
     */
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + user.getEmail());
        }
        log.info("Creating new user with email: {}", user.getEmail());
        return userRepository.save(user);
    }

    /**
     * Get a user by ID
     * 
     * @param id the user ID
     * @return Optional containing the user if found
     */
    @Transactional(readOnly = true)
    public Optional<User> getUserById(Long id) {
        log.debug("Fetching user with ID: {}", id);
        return userRepository.findById(id);
    }

    /**
     * Get a user by email
     * 
     * @param email the email address
     * @return Optional containing the user if found
     */
    @Transactional(readOnly = true)
    public Optional<User> getUserByEmail(String email) {
        log.debug("Fetching user with email: {}", email);
        return userRepository.findByEmail(email);
    }

    /**
     * Get all users
     * 
     * @return List of all users
     */
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        log.debug("Fetching all users");
        return userRepository.findAll();
    }

    /**
     * Get all active users
     * 
     * @return List of active users
     */
    @Transactional(readOnly = true)
    public List<User> getActiveUsers() {
        log.debug("Fetching all active users");
        return userRepository.findByActiveTrue();
    }

    /**
     * Update a user
     * 
     * @param id the user ID
     * @param userDetails the updated user details
     * @return the updated user
     */
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        
        if (userDetails.getUsername() != null) {
            user.setUsername(userDetails.getUsername());
        }
        if (userDetails.getFirstName() != null) {
            user.setFirstName(userDetails.getFirstName());
        }
        if (userDetails.getLastName() != null) {
            user.setLastName(userDetails.getLastName());
        }
        if (userDetails.getRole() != null) {
            user.setRole(userDetails.getRole());
        }
        if (userDetails.getActive() != null) {
            user.setActive(userDetails.getActive());
        }

        log.info("Updating user with ID: {}", id);
        return userRepository.save(user);
    }

    /**
     * Delete a user
     * 
     * @param id the user ID
     */
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        log.info("Deleting user with ID: {}", id);
        userRepository.delete(user);
    }
}
