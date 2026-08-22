package com.servicelink.core.dto.request.admin.subscription;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Value;

@Value
public class RevokeSubscriptionRequest {
    @NotBlank
    @Size(min = 5, max = 2000)
    String reason;
}