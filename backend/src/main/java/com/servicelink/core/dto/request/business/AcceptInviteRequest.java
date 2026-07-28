package com.servicelink.core.dto.request.business;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AcceptInviteRequest {
    @NotBlank
    private String token;

    @NotBlank @Size(min = 8)
    private String password;
}