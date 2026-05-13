package com.linkwise.service;

import com.linkwise.entity.Permission;
import com.linkwise.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Permission Service
 * Business logic layer for permission-related operations
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PermissionService {
    
    private final PermissionRepository permissionRepository;
    
    /**
     * Get all permissions
     */
    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }
    
    /**
     * Get permissions by module
     */
    public List<Permission> getPermissionsByModule(String module) {
        return permissionRepository.findByModule(module);
    }
    
    /**
     * Get permission by code
     */
    public Permission getPermissionByCode(String code) {
        return permissionRepository.findByCode(code).orElse(null);
    }
}
