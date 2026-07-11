package com.servicelink.core.service.provider.subscription;

import com.servicelink.core.dto.response.provider.subscription.SubscriptionStatusDTO;
import com.servicelink.core.exception.BusinessException;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.provider.subscription.ProviderSubscription;
import com.servicelink.core.model.provider.subscription.SubscriptionPlanType;
import com.servicelink.core.model.provider.subscription.SubscriptionStatus;
import com.servicelink.core.repository.provider.ProviderRepository;
import com.servicelink.core.repository.provider.subscription.ProviderSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProviderSubscriptionService {

    private final ProviderSubscriptionRepository subscriptionRepo;
    private final ProviderRepository providerRepo;

    @Transactional
    public ProviderSubscription issueTrialIfEligible(Provider provider) {
        return subscriptionRepo.findByProvider_Id(provider.getId())
                .orElseGet(() -> {
                    Instant now = Instant.now();
                    ProviderSubscription sub = ProviderSubscription.builder()
                            .provider(provider)
                            .planType(SubscriptionPlanType.FREE_TRIAL)
                            .status(SubscriptionStatus.ACTIVE)
                            .startDate(now)
                            .endDate(now.plus(SubscriptionPlanType.FREE_TRIAL.getDurationDays(), ChronoUnit.DAYS))
                            .trialUsed(true)
                            .referralBonusDaysTotal(0)
                            .build();

                    // Trial issuance is the moment a provider becomes publicly
                    // eligible on the subscription axis — make that explicit
                    // rather than relying on whatever isActive happened to be.
                    syncProviderIsActive(provider, true);

                    log.info("Issued {}-day free trial to provider {}",
                            SubscriptionPlanType.FREE_TRIAL.getDurationDays(), provider.getId());
                    return subscriptionRepo.save(sub);
                });
    }

    @Transactional(readOnly = true)
    public SubscriptionStatusDTO getStatus(Long providerId) {
        ProviderSubscription sub = subscriptionRepo.findByProvider_Id(providerId)
                .orElseThrow(() -> new BusinessException(
                        "No subscription found for provider", "SUBSCRIPTION_NOT_FOUND"));
        return toDto(sub);
    }

    /**
     * Referral bonus can revive an already-expired (isActive=false) provider —
     * extend() flips status back to ACTIVE when it does, so mirror that onto
     * isActive too.
     */
    @Transactional
    public SubscriptionStatusDTO addReferralBonus(Long providerId, int bonusMonths) {
        ProviderSubscription sub = subscriptionRepo.findByProvider_Id(providerId)
                .orElseThrow(() -> new BusinessException(
                        "No subscription found for provider", "SUBSCRIPTION_NOT_FOUND"));

        int bonusDays = bonusMonths * 30;
        sub.extend(bonusDays);
        sub.setReferralBonusDaysTotal(sub.getReferralBonusDaysTotal() + bonusDays);
        subscriptionRepo.save(sub);

        syncProviderIsActive(sub.getProvider(), sub.getStatus() == SubscriptionStatus.ACTIVE);

        log.info("Credited {} referral bonus day(s) to provider {} (new end date {})",
                bonusDays, providerId, sub.getEndDate());
        return toDto(sub);
    }

    /**
     * Payment-driven upgrade/renewal — always brings the provider back to ACTIVE.
     * <p>
     * Stacking rule: if the current subscription (trial or paid) still has time
     * left, that remaining time is carried over and the new plan's duration is
     * added on top of it, rather than overwriting endDate outright. If the
     * current subscription has already lapsed, the new plan simply starts a
     * fresh cycle from now.
     */
    @Transactional
    public SubscriptionStatusDTO upgradePlan(Long providerId, SubscriptionPlanType newPlan) {
        ProviderSubscription sub = subscriptionRepo.findByProvider_Id(providerId)
                .orElseThrow(() -> new BusinessException(
                        "No subscription found for provider", "SUBSCRIPTION_NOT_FOUND"));

        Instant now = Instant.now();
        boolean hasRemainingTime = sub.getEndDate() != null && sub.getEndDate().isAfter(now);
        Instant carryOverBase = hasRemainingTime ? sub.getEndDate() : now;
        long carriedOverDays = hasRemainingTime ? ChronoUnit.DAYS.between(now, sub.getEndDate()) : 0;

        sub.setPlanType(newPlan);
        sub.setStatus(SubscriptionStatus.ACTIVE);
        if (!hasRemainingTime) {
            // Nothing left to carry over — this purchase starts a brand new cycle.
            sub.setStartDate(now);
        }
        // If time remains, startDate is deliberately left untouched so the
        // start→end span still reflects the full stacked period (used by the
        // frontend to render the billing-period progress bar correctly).
        sub.setEndDate(carryOverBase.plus(newPlan.getDurationDays(), ChronoUnit.DAYS));
        subscriptionRepo.save(sub);

        syncProviderIsActive(sub.getProvider(), true);

        log.info("Provider {} upgraded to {} — {} carried-over day(s) + {} new day(s), new end date {}",
                providerId, newPlan, carriedOverDays, newPlan.getDurationDays(), sub.getEndDate());
        return toDto(sub);
    }

    /**
     * Daily sweep — flips lapsed subscriptions to EXPIRED, and turns the
     * linked Provider's isActive off in the same pass. This is the one place
     * isActive gets forced to false purely by subscription state; admins can
     * still suspend a provider manually at any other time.
     */
    @Scheduled(cron = "0 5 0 * * *") // 00:05 every day
    @Transactional
    public void expireOverdueSubscriptions() {
        List<ProviderSubscription> overdue =
                subscriptionRepo.findByStatusAndEndDateBefore(SubscriptionStatus.ACTIVE, Instant.now());

        overdue.forEach(sub -> {
            sub.setStatus(SubscriptionStatus.EXPIRED);
            syncProviderIsActive(sub.getProvider(), false);
        });

        subscriptionRepo.saveAll(overdue);
        if (!overdue.isEmpty()) {
            log.info("Expired {} provider subscription(s) and deactivated their providers", overdue.size());
        }
    }

    /**
     * Single point of truth for the subscription -> isActive link. Only
     * writes when the value actually changes, so it never clobbers a manual
     * admin suspension with a redundant "true" write on an unrelated update.
     */
    private void syncProviderIsActive(Provider provider, boolean shouldBeActive) {
        if (!Boolean.valueOf(shouldBeActive).equals(provider.getIsActive())) {
            provider.setIsActive(shouldBeActive);
            providerRepo.save(provider);
            log.info("Provider {} isActive -> {} (subscription-driven)", provider.getId(), shouldBeActive);
        }
    }

    private SubscriptionStatusDTO toDto(ProviderSubscription sub) {
        return SubscriptionStatusDTO.builder()
                .planType(sub.getPlanType())
                .status(sub.getStatus())
                .startDate(sub.getStartDate())
                .endDate(sub.getEndDate())
                .daysRemaining(sub.getDaysRemaining())
                .isActive(sub.isCurrentlyActive())
                .trialUsed(sub.getTrialUsed())
                .referralBonusDaysTotal(sub.getReferralBonusDaysTotal())
                .build();
    }
}