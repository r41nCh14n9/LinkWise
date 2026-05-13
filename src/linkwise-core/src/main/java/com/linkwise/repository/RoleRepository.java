package com.linkwise.repository;

import com.linkwise.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Role Repository
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    
    Optional<Role> findByName(String name);
    
    Optional<Role> findByNameAndOrganizationId(String name, Long organizationId);
    
    List<Role> findByOrganizationIdIsNull();
    
    List<Role> findByOrganizationId(Long organizationId);
    
    List<Role> findByOrganizationIdOrOrganizationIdIsNull(Long organizationId);
}
