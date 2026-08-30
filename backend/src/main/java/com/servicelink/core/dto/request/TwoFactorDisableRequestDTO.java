package com.servicelink.core.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TwoFactorDisableRequestDTO {
    @NotBlank(message = "Current password is required")
    private String currentPassword;

    private String code;
}
