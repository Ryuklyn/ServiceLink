package com.servicelink.core.dto.request.business;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InviteTeamMemberRequest {
    @NotBlank
    private String fullName;

    @NotBlank @Email
    private String email;

    @NotBlank
    private String role; // MANAGER, STAFF, FINANCE — never ADMIN
}