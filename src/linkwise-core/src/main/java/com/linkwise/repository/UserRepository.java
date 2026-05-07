package com.linkwise.repository;

import com.linkwise.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

/**
 * User Repository
 * 
 * Data access layer for User entity operations.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find a user by email address
     * 
     * @param email the email address
     * @return Optional containing the user if found
     */
    Optional<User> findByEmail(String email);

    /**
     * Find a user by username
     * 
     * @param username the username
     * @return Optional containing the user if found
     */
    Optional<User> findByUsername(String username);

    /**
     * Find all active users
     * 
     * @return List of active users
     */
    List<User> findByActiveTrue();

    /**
     * Check if a user exists by email
     * 
     * @param email the email address
     * @return true if user exists, false otherwise
     */
    boolean existsByEmail(String email);
}
