package com.servicelink.core.service.provider.subscription;

import com.servicelink.core.model.provider.subscription.ProviderSubscription;
import com.servicelink.core.model.provider.subscription.SubscriptionPlanType;
import com.servicelink.core.model.provider.subscription.SubscriptionStatus;
import com.servicelink.core.repository.provider.subscription.ProviderSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProOrdersEligibilityChecker {

    private final ProviderSubscriptionRepository subscriptionRepo;

    public boolean isEligible(Long providerId) {
        return subscriptionRepo.findTopByProvider_IdOrderByCreatedAtDesc(providerId)
                .filter(sub -> sub.getPlanType() != SubscriptionPlanType.FREE_TRIAL)
                .filter(sub -> sub.getStatus() == SubscriptionStatus.ACTIVE)
                .map(ProviderSubscription::isCurrentlyActive)
                .orElse(false);
    }
}
