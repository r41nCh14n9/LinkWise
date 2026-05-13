package com.linkwise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Permission DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermissionDTO {
    private Long id;
    private String code;
    private String module;
    private String feature;
    private String description;
    private String dataLevel;
    private String operation;
}
