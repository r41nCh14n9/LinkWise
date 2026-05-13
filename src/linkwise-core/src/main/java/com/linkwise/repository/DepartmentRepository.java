package com.linkwise.repository;

import com.linkwise.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Department Repository
 */
@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    
    List<Department> findByOrganizationId(Long organizationId);
    
    Optional<Department> findByIdAndOrganizationId(Long id, Long organizationId);
    
    Optional<Department> findByCodeAndOrganizationId(String code, Long organizationId);
    
    List<Department> findByParentIdAndOrganizationId(Long parentId, Long organizationId);
    
    @Query("SELECT d FROM Department d WHERE d.organizationId = :orgId AND d.parentId IS NULL")
    List<Department> findRootDepartments(@Param("orgId") Long orgId);
}
