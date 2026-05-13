package com.linkwise.controller;

import com.linkwise.entity.AuditLog;
import com.linkwise.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Audit Log Controller
 * REST API endpoints for audit log retrieval (Admin only)
 */
@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "Audit log retrieval APIs (Admin only)")
public class AuditLogController {

    private final AuditLogService auditLogService;

    /**
     * Get all audit logs for organization (Admin only)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get audit logs for organization")
    public ResponseEntity<Map<String, Object>> getAuditLogs(
            @RequestParam(value = "org_id", required = true) Long organizationId) {
        try {
            List<AuditLog> auditLogs = auditLogService.getAuditLogsByOrganization(organizationId);
            Map<String, Object> response = new HashMap<>();
            response.put("code", "SUCCESS");
            response.put("data", auditLogs);
            response.put("count", auditLogs.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return buildErrorResponse("Failed to retrieve audit logs", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get audit logs by entity type (Admin only)
     */
    @GetMapping("/by-entity-type")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get audit logs by entity type")
    public ResponseEntity<Map<String, Object>> getAuditLogsByEntityType(
            @RequestParam(value = "org_id", required = true) Long organizationId,
            @RequestParam(value = "entity_type", required = true) String entityType) {
        try {
            List<AuditLog> auditLogs = auditLogService.getAuditLogsByEntityType(organizationId, entityType);
            Map<String, Object> response = new HashMap<>();
            response.put("code", "SUCCESS");
            response.put("data", auditLogs);
            response.put("count", auditLogs.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return buildErrorResponse("Failed to retrieve audit logs", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get audit logs by entity ID (Admin only)
     */
    @GetMapping("/by-entity/{entityId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get audit logs for specific entity")
    public ResponseEntity<Map<String, Object>> getAuditLogsByEntity(
            @PathVariable Long entityId) {
        try {
            List<AuditLog> auditLogs = auditLogService.getAuditLogsByEntity(entityId);
            Map<String, Object> response = new HashMap<>();
            response.put("code", "SUCCESS");
            response.put("data", auditLogs);
            response.put("count", auditLogs.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return buildErrorResponse("Failed to retrieve audit logs", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get audit logs by user (Admin only)
     */
    @GetMapping("/by-user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get audit logs by user")
    public ResponseEntity<Map<String, Object>> getAuditLogsByUser(
            @PathVariable Long userId) {
        try {
            List<AuditLog> auditLogs = auditLogService.getAuditLogsByUser(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("code", "SUCCESS");
            response.put("data", auditLogs);
            response.put("count", auditLogs.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return buildErrorResponse("Failed to retrieve audit logs", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get audit logs within date range (Admin only)
     */
    @GetMapping("/by-date-range")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get audit logs by date range")
    public ResponseEntity<Map<String, Object>> getAuditLogsByDateRange(
            @RequestParam(value = "org_id", required = true) Long organizationId,
            @RequestParam(value = "start_date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(value = "end_date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            List<AuditLog> auditLogs = auditLogService.getAuditLogsInDateRange(organizationId, startDate, endDate);
            Map<String, Object> response = new HashMap<>();
            response.put("code", "SUCCESS");
            response.put("data", auditLogs);
            response.put("count", auditLogs.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return buildErrorResponse("Failed to retrieve audit logs", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(String message, HttpStatus status) {
        Map<String, Object> response = new HashMap<>();
        response.put("code", "ERROR");
        response.put("message", message);
        return ResponseEntity.status(status).body(response);
    }
}
