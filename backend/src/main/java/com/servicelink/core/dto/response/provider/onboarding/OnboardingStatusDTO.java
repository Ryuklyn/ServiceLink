package com.servicelink.core.dto.response.provider.onboarding;

import com.servicelink.core.model.provider.subscription.SubscriptionPlanType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingStatusDTO {
    private boolean hasCompletedOnboarding;
    private boolean hasProfilePicture;
    private boolean hasBio;
    private boolean hasServiceArea;
    private boolean hasAtLeastOneService;

    // Renamed from a bare "trialDaysRemaining" — now genuinely reflects
    // whatever plan is currently active (trial or paid), not just trial.
    private long                 subscriptionDaysRemaining;
    private SubscriptionPlanType subscriptionPlanType;
    private boolean              subscriptionActive;

    private String referralCode;
}
