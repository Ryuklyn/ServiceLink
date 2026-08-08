package com.servicelink.core.dto.request.provider.service;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateCategoryDTO {

    @NotBlank
    @Size(max = 100)
    private String name;
}
