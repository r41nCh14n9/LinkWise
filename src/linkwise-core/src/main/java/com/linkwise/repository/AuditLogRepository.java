package com.linkwise.repository;

import com.linkwise.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Audit Log Repository
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /**
     * Find audit logs by user ID
     */
    List<AuditLog> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find audit logs by entity type
     */
    List<AuditLog> findByEntityTypeOrderByCreatedAtDesc(String entityType);

    /**
     * Find audit logs by entity ID
     */
    List<AuditLog> findByEntityIdOrderByCreatedAtDesc(Long entityId);

    /**
     * Find audit logs by organization ID
     */
    List<AuditLog> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);

    /**
     * Find audit logs within date range
     */
    @Query("SELECT a FROM AuditLog a WHERE a.organizationId = :orgId " +
           "AND a.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY a.createdAt DESC")
    List<AuditLog> findByDateRange(@Param("orgId") Long organizationId,
                                   @Param("startDate") LocalDateTime startDate,
                                   @Param("endDate") LocalDateTime endDate);

    /**
     * Find audit logs by entity type and organization
     */
    @Query("SELECT a FROM AuditLog a WHERE a.organizationId = :orgId " +
           "AND a.entityType = :entityType ORDER BY a.createdAt DESC")
    List<AuditLog> findByEntityTypeAndOrganization(@Param("orgId") Long organizationId,
                                                  @Param("entityType") String entityType);
}
