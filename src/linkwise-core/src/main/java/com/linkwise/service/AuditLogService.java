package com.linkwise.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linkwise.entity.AuditLog;
import com.linkwise.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Audit Log Service
 * Handles audit logging for all data modifications
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    /**
     * Log a data modification
     */
    public void logAction(Long userId, String entityType, Long entityId, 
                         String action, String entityName, String description,
                         Long organizationId) {
        try {
            AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .entityName(entityName)
                .description(description)
                .organizationId(organizationId)
                .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Error logging audit action: {}", e.getMessage(), e);
        }
    }

    /**
     * Log a data modification with before and after values
     */
    public void logActionWithValues(Long userId, String entityType, Long entityId,
                                    String action, String entityName, String description,
                                    Object oldValues, Object newValues, Long organizationId) {
        try {
            AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .entityName(entityName)
                .description(description)
                .oldValues(objectMapper.writeValueAsString(oldValues))
                .newValues(objectMapper.writeValueAsString(newValues))
                .organizationId(organizationId)
                .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Error logging audit action with values: {}", e.getMessage(), e);
        }
    }

    /**
     * Get audit logs by organization (only for admin)
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsByOrganization(Long organizationId) {
        return auditLogRepository.findByOrganizationIdOrderByCreatedAtDesc(organizationId);
    }

    /**
     * Get audit logs by entity type
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsByEntityType(Long organizationId, String entityType) {
        return auditLogRepository.findByEntityTypeAndOrganization(organizationId, entityType);
    }

    /**
     * Get audit logs by entity ID
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsByEntity(Long entityId) {
        return auditLogRepository.findByEntityIdOrderByCreatedAtDesc(entityId);
    }

    /**
     * Get audit logs by user
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsByUser(Long userId) {
        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get audit logs within date range
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsInDateRange(Long organizationId, 
                                                   LocalDateTime startDate,
                                                   LocalDateTime endDate) {
        return auditLogRepository.findByDateRange(organizationId, startDate, endDate);
    }
}
