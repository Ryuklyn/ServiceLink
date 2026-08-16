package com.servicelink.core.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TwoFactorSetupVerifyRequestDTO {
    @NotBlank
    @Size(min = 6, max = 6, message = "Enter the 6-digit code")
    private String otp;
}