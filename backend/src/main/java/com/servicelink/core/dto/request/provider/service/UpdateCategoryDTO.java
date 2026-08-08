package com.servicelink.core.dto.request.provider.service;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateCategoryDTO {

    @Size(max = 100)
    private String name;
}