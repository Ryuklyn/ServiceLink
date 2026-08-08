package com.servicelink.core.dto.request.provider.service;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CreateCategoryWithServicesDTO {

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotEmpty
    @Valid
    private List<SubServiceInputDTO> subServices;
}