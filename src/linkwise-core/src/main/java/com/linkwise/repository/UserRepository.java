package com.linkwise.repository;

import com.linkwise.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    /**
     * Check if a user with email exists in a specific organization
     * 
     * @param email the email address
     * @param organizationId the organization ID
     * @return true if user exists in organization, false otherwise
     */
    boolean existsByEmailAndOrganizationId(String email, Long organizationId);

    /**
     * Find all users in a specific organization
     * 
     * @param organizationId the organization ID
     * @return List of users in the organization
     */
    List<User> findByOrganizationId(Long organizationId);

    /**
     * Find all users in a specific department
     * 
     * @param departmentId the department ID
     * @return List of users in the department
     */
    List<User> findByDepartmentId(Long departmentId);

    /**
     * Search users by email in a specific organization
     * 
     * @param organizationId the organization ID
     * @param searchTerm the search term for email
     * @return List of matching users
     */
    @Query("SELECT u FROM User u WHERE u.organizationId = :organizationId AND u.email LIKE %:searchTerm%")
    List<User> searchByEmailInOrganization(@Param("organizationId") Long organizationId, @Param("searchTerm") String searchTerm);
}
