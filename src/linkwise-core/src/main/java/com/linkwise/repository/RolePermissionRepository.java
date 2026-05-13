package com.linkwise.repository;

import com.linkwise.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * RolePermission Repository
 */
@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {
    
    List<RolePermission> findByRoleId(Long roleId);
    
    List<RolePermission> findByPermissionId(Long permissionId);
    
    void deleteByRoleIdAndPermissionId(Long roleId, Long permissionId);
    
    void deleteByRoleId(Long roleId);
}
