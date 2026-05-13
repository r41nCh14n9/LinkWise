package com.linkwise.repository;

import com.linkwise.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Organization Repository
 * Data access layer for Organization entity operations
 */
@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
}
