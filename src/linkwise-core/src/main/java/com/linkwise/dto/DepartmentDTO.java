package com.linkwise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Department DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentDTO {
    private Long id;
    private Long organizationId;
    private String name;
    private String code;
    private Long parentId;
    private Long managerId;
    private String managerName;
    private String path;
    private Integer level;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
