package com.linkwise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Create User Request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateUserRequest {
    private String email;
    private String username;
    private String firstName;
    private String lastName;
    private String password;
    private Long departmentId;
    private List<Long> roleIds;
}

/**
 * Update User Request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class UpdateUserRequest {
    private String username;
    private String firstName;
    private String lastName;
    private Long departmentId;
    private List<Long> roleIds;
    private String status;
}
