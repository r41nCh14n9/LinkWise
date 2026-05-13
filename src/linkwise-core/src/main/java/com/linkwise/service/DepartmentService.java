package com.linkwise.service;

import com.linkwise.dto.DepartmentDTO;
import com.linkwise.entity.Department;
import com.linkwise.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Department Service
 * Business logic layer for department-related operations
 */
@Service
@RequiredArgsConstructor
@Transactional
public class DepartmentService {
    
    private final DepartmentRepository departmentRepository;
    
    /**
     * Get all departments for organization
     */
    @Transactional(readOnly = true)
    public List<DepartmentDTO> getAllDepartments(Long organizationId) {
        return departmentRepository.findByOrganizationId(organizationId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Get department tree for organization
     */
    @Transactional(readOnly = true)
    public List<DepartmentDTO> getDepartmentTree(Long organizationId) {
        List<Department> rootDepts = departmentRepository.findRootDepartments(organizationId);
        return rootDepts.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Get department by ID
     */
    @Transactional(readOnly = true)
    public DepartmentDTO getDepartmentById(Long deptId, Long organizationId) {
        return departmentRepository.findByIdAndOrganizationId(deptId, organizationId)
            .map(this::convertToDTO)
            .orElse(null);
    }
    
    /**
     * Create department
     */
    public Department createDepartment(Long organizationId, String name, String code, 
                                      Long parentId, Long managerId) {
        Department parentDept = null;
        String path = "/" + organizationId;
        int level = 1;
        
        if (parentId != null) {
            parentDept = departmentRepository.findById(parentId).orElse(null);
            if (parentDept != null) {
                path = (parentDept.getPath() != null ? parentDept.getPath() : "") + "/" + parentId;
                level = parentDept.getLevel() + 1;
            }
        }
        
        Department department = Department.builder()
            .organizationId(organizationId)
            .name(name)
            .code(code)
            .parentId(parentId)
            .managerId(managerId)
            .path(path)
            .level(level)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        
        return departmentRepository.save(department);
    }
    
    /**
     * Update department
     */
    public Department updateDepartment(Long deptId, String name, String code, Long managerId) {
        Department department = departmentRepository.findById(deptId).orElse(null);
        if (department != null) {
            if (name != null) department.setName(name);
            if (code != null) department.setCode(code);
            if (managerId != null) department.setManagerId(managerId);
            department.setUpdatedAt(LocalDateTime.now());
            return departmentRepository.save(department);
        }
        return null;
    }
    
    /**
     * Get child departments
     */
    @Transactional(readOnly = true)
    public List<DepartmentDTO> getChildDepartments(Long parentId, Long organizationId) {
        return departmentRepository.findByParentIdAndOrganizationId(parentId, organizationId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Convert Department to DepartmentDTO
     */
    private DepartmentDTO convertToDTO(Department dept) {
        return DepartmentDTO.builder()
            .id(dept.getId())
            .organizationId(dept.getOrganizationId())
            .name(dept.getName())
            .code(dept.getCode())
            .parentId(dept.getParentId())
            .managerId(dept.getManagerId())
            .path(dept.getPath())
            .level(dept.getLevel())
            .createdAt(dept.getCreatedAt())
            .updatedAt(dept.getUpdatedAt())
            .build();
    }
}
