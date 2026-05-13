package com.linkwise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Generic API Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse {
    private String code;          // SUCCESS, CREATED, ERROR, UNAUTHORIZED, etc.
    private Object data;          // Response data
    private String message;       // Optional message
}
