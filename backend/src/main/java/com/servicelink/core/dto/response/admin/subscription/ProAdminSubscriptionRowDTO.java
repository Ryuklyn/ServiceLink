package com.servicelink.core.dto.response.admin.subscription;

import com.servicelink.core.model.business.PlanType;
import com.servicelink.core.model.business.SubscriptionStatus;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class ProAdminSubscriptionRowDTO {
    Long workspaceId;
    String organizationName;
    String referenceId;
    PlanType planType;
    SubscriptionStatus status;
    LocalDateTime trialEndsAt;
    LocalDateTime currentPeriodStart;
    LocalDateTime currentPeriodEnd;
    Long amountNpr;
    LocalDateTime createdAt;
}
