package com.servicelink.core.dto.response.provider.service;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryDTO {
    private Long id;
    private String name;
    private Boolean isActive;
    private int subServiceCount; // convenience for the admin UI, not persisted
}
