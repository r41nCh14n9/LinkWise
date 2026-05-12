package com.linkwise.service;

import com.linkwise.entity.User;
import com.linkwise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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
        return userRepository.findByEmail(email);
    }

    /**
     * Get all users
     * 
     * @return List of all users
     */
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Get all active users
     * 
     * @return List of active users
     */
    @Transactional(readOnly = true)
    public List<User> getActiveUsers() {
        return userRepository.findByActiveTrue();
    }

    /**
     * Update a user (simplified version without using getters)
     */
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        return userRepository.save(user);  // Just save without modification for now
    }

    /**
     * Delete a user
     * 
     * @param id the user ID
     */
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        userRepository.delete(user);
    }
}
