package com.servicelink.core.dto.request;

import com.servicelink.core.model.user.TwoFactorMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TwoFactorSetupInitRequestDTO {
    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @NotNull(message = "Method is required")
    private TwoFactorMethod method;
}
