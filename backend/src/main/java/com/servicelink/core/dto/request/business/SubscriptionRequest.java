package com.servicelink.core.dto.request.business;

import com.servicelink.core.model.business.PlanType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class SubscriptionRequest {

    @NotNull(message = "Workspace ID is required")
    private Long workspaceId;

    @NotNull(message = "Plan Type is required")
    private PlanType planType;

    @NotNull(message = "Amount is required")
    @Positive
    private Long amountNpr;
}
