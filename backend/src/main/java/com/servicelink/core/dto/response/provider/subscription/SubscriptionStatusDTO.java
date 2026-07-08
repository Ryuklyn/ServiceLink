package com.servicelink.core.dto.response.provider.subscription;

import com.servicelink.core.model.provider.subscription.SubscriptionPlanType;
import com.servicelink.core.model.provider.subscription.SubscriptionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class SubscriptionStatusDTO {
    private SubscriptionPlanType planType;
    private SubscriptionStatus   status;
    private Instant startDate;
    private Instant endDate;
    private long    daysRemaining;
    private boolean isActive;
    private boolean trialUsed;
    private int     referralBonusDaysTotal;
}
