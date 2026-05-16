package com.servicelink.core.dto.response.business;

import com.servicelink.core.model.business.PlanType;
import com.servicelink.core.model.business.SubscriptionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SubscriptionResponse {
    private Long id;
    private Long workspaceId;
    private PlanType planType;
    private Long amountNpr;
    private SubscriptionStatus status;
    private String referenceId;
    private LocalDateTime trialEndsAt;
    private LocalDateTime currentPeriodStart;
    private LocalDateTime currentPeriodEnd;
    private LocalDateTime createdAt;
}
