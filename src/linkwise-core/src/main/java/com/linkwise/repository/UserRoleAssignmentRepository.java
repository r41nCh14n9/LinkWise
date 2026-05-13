package com.linkwise.repository;

import com.linkwise.entity.UserRoleAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * UserRoleAssignment Repository
 */
@Repository
public interface UserRoleAssignmentRepository extends JpaRepository<UserRoleAssignment, Long> {
    
    List<UserRoleAssignment> findByUserId(Long userId);
    
    List<UserRoleAssignment> findByRoleId(Long roleId);
    
    void deleteByUserId(Long userId);
    
    void deleteByUserIdAndRoleId(Long userId, Long roleId);
}
