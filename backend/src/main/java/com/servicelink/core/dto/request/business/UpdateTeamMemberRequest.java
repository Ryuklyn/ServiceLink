package com.servicelink.core.dto.request.business;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateTeamMemberRequest {
    @NotBlank
    private String fullName;
    @NotBlank
    private String role;
}