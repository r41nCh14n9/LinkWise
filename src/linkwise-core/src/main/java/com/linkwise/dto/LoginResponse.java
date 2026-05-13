package com.linkwise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Login Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private Long id;
    private String email;
    private String username;
    private String firstName;
    private String lastName;
    private String status;
    private Long organizationId;
    private List<String> roles;
    private List<String> permissions;
    private String token;
}
