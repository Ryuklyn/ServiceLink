package com.servicelink.core.dto.request.provider;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CheckDeviceRequestDTO {
    @NotBlank
    private String deviceId;
}
