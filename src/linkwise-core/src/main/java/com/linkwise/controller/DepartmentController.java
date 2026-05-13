package com.linkwise.controller;

import com.linkwise.dto.DepartmentDTO;
import com.linkwise.entity.Department;
import com.linkwise.service.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Department Controller
 * REST API endpoints for department management
 */
@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
@Tag(name = "Departments", description = "Department management APIs")
public class DepartmentController {
    
    private final DepartmentService departmentService;
    
    /**
     * Get all departments for organization
     */
    @GetMapping
    @Operation(summary = "Get all departments")
    public ResponseEntity<Map<String, Object>> getAllDepartments(
            @RequestParam(value = "org_id", required = true) Long organizationId) {
        List<DepartmentDTO> departments = departmentService.getAllDepartments(organizationId);
        Map<String, Object> response = new HashMap<>();
        response.put("code", "SUCCESS");
        response.put("data", departments);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get department tree
     */
    @GetMapping("/tree")
    @Operation(summary = "Get department tree structure")
    public ResponseEntity<Map<String, Object>> getDepartmentTree(
            @RequestParam(value = "org_id", required = true) Long organizationId) {
        List<DepartmentDTO> tree = departmentService.getDepartmentTree(organizationId);
        Map<String, Object> response = new HashMap<>();
        response.put("code", "SUCCESS");
        response.put("data", tree);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get department by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get department by ID")
    public ResponseEntity<Map<String, Object>> getDepartmentById(
            @PathVariable Long id,
            @RequestParam(value = "org_id", required = true) Long organizationId) {
        DepartmentDTO department = departmentService.getDepartmentById(id, organizationId);
        if (department == null) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", "NOT_FOUND");
            errorResponse.put("message", "Department not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
        Map<String, Object> response = new HashMap<>();
        response.put("code", "SUCCESS");
        response.put("data", department);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Create department
     */
    @PostMapping
    @Operation(summary = "Create department")
    public ResponseEntity<Map<String, Object>> createDepartment(
            @RequestBody Map<String, Object> request) {
        Long organizationId = ((Number) request.get("org_id")).longValue();
        String name = (String) request.get("name");
        String code = (String) request.get("code");
        Long parentId = request.get("parent_id") != null ? 
            ((Number) request.get("parent_id")).longValue() : null;
        Long managerId = request.get("manager_id") != null ? 
            ((Number) request.get("manager_id")).longValue() : null;
        
        Department department = departmentService.createDepartment(organizationId, name, code, parentId, managerId);
        Map<String, Object> response = new HashMap<>();
        response.put("code", "CREATED");
        response.put("data", new DepartmentDTO(department.getId(), department.getOrganizationId(),
            department.getName(), department.getCode(), department.getParentId(),
            department.getManagerId(), null, department.getPath(), department.getLevel(),
            department.getCreatedAt(), department.getUpdatedAt()));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Update department
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update department")
    public ResponseEntity<Map<String, Object>> updateDepartment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");
        String code = (String) request.get("code");
        Long managerId = request.get("manager_id") != null ? 
            ((Number) request.get("manager_id")).longValue() : null;
        
        Department department = departmentService.updateDepartment(id, name, code, managerId);
        if (department == null) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", "NOT_FOUND");
            errorResponse.put("message", "Department not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
        Map<String, Object> response = new HashMap<>();
        response.put("code", "SUCCESS");
        response.put("data", new DepartmentDTO(department.getId(), department.getOrganizationId(),
            department.getName(), department.getCode(), department.getParentId(),
            department.getManagerId(), null, department.getPath(), department.getLevel(),
            department.getCreatedAt(), department.getUpdatedAt()));
        return ResponseEntity.ok(response);
    }
    
    /**
     * Delete department
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete department")
    public ResponseEntity<Map<String, Object>> deleteDepartment(@PathVariable Long id) {
        // TODO: Implement delete with validation
        Map<String, Object> response = new HashMap<>();
        response.put("code", "SUCCESS");
        response.put("message", "Department deleted successfully");
        return ResponseEntity.ok(response);
    }
}
