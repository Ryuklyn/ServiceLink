package com.servicelink.core.dto.request.business;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class KybRequest {

    @NotNull(message = "Organization ID is required")
    private Long organizationId;

    @NotBlank(message = "Tax ID is required")
    @Size(max = 50)
    private String taxId;

    @NotNull(message = "Authorization confirmation is required")
    private Boolean authorizedConfirmed;


    // documentFile comes as MultipartFile in the controller — not in this DTO
}
