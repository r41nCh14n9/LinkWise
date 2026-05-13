package com.linkwise.service;

import com.linkwise.entity.User;
import com.linkwise.entity.Organization;
import com.linkwise.entity.UserRoleAssignment;
import com.linkwise.repository.OrganizationRepository;
import com.linkwise.repository.UserRepository;
import com.linkwise.repository.UserRoleAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Initialize default organization and preset user accounts
 */
@Component
@RequiredArgsConstructor
public class DefaultDataInitializer implements CommandLineRunner {
    
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final UserRoleAssignmentRepository userRoleAssignmentRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Create default organization if not exists
        if (organizationRepository.count() == 0) {
            Organization org = Organization.builder()
                .name("Default Organization")
                .description("Default organization for development")
                .active(true)
                .build();
            organizationRepository.save(org);
        }
        
        // Get the default organization (should be id=1)
        Organization defaultOrg = organizationRepository.findById(1L)
            .orElseThrow(() -> new RuntimeException("Default organization not found"));
        
        // Create preset users if they don't exist
        createPresetUser("admin@linkwise.com", "admin", "System", "Administrator", defaultOrg.getId());
        createPresetUser("user@linkwise.com", "user", "John", "User", defaultOrg.getId());
        createPresetUser("supervisor@linkwise.com", "supervisor", "Manager", "Supervisor", defaultOrg.getId());
        createPresetUser("agent@linkwise.com", "agent", "Peter", "Agent", defaultOrg.getId());
        createPresetUser("ap@linkwise.com", "ap", "Alice", "Finance", defaultOrg.getId());
        
        // Assign roles
        assignRoleIfNotExists("admin@linkwise.com", 1L);       // admin -> ADMIN
        assignRoleIfNotExists("user@linkwise.com", 2L);        // user -> USER
        assignRoleIfNotExists("supervisor@linkwise.com", 3L);  // supervisor -> SUPERVISOR
        assignRoleIfNotExists("agent@linkwise.com", 4L);       // agent -> AGENT
        assignRoleIfNotExists("ap@linkwise.com", 5L);          // ap -> AP
    }
    
    private void createPresetUser(String email, String username, String firstName, String lastName, Long orgId) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                .email(email)
                .username(username)
                .password(passwordEncoder.encode("AdminPass@2024")) // Properly encode the password
                .firstName(firstName)
                .lastName(lastName)
                .organizationId(orgId)
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
            userRepository.save(user);
        }
    }
    
    private void assignRoleIfNotExists(String email, Long roleId) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found: " + email));
        
        if (!userRoleAssignmentRepository.existsByUserIdAndRoleId(user.getId(), roleId)) {
            UserRoleAssignment assignment = UserRoleAssignment.builder()
                .userId(user.getId())
                .roleId(roleId)
                .build();
            userRoleAssignmentRepository.save(assignment);
        }
    }
}
