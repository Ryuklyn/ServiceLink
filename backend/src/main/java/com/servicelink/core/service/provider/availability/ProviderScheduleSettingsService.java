package com.servicelink.core.service.provider.availability;

import com.servicelink.core.dto.availability.ScheduleSettingsDTO;
import com.servicelink.core.exception.BusinessException;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.provider.availability.ProviderScheduleSettings;
import com.servicelink.core.model.provider.subscription.ProviderSubscription;
import com.servicelink.core.model.provider.subscription.SubscriptionPlanType;
import com.servicelink.core.model.provider.subscription.SubscriptionStatus;
import com.servicelink.core.repository.provider.ProviderRepository;
import com.servicelink.core.repository.provider.availability.ProviderScheduleSettingsRepository;
import com.servicelink.core.service.provider.subscription.ProOrdersEligibilityChecker;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProviderScheduleSettingsService {

    private final ProviderScheduleSettingsRepository repo;
    private final ProviderRepository providerRepo;
    private final ProOrdersEligibilityChecker eligibilityChecker;

    @Transactional
    public ProviderScheduleSettings getOrCreate(Long providerId) {
        return repo.findById(providerId).orElseGet(() -> {
            Provider provider = providerRepo.getReferenceById(providerId);
            return repo.save(ProviderScheduleSettings.builder()
                    .provider(provider).providerId(providerId).build());
        });
    }

    @Transactional(readOnly = true)
    public ScheduleSettingsDTO getMySettings(Long userId) {
        Provider provider = requireProvider(userId);
        var s = getOrCreate(provider.getId());
        return new ScheduleSettingsDTO(s.getWorkingDays(), s.getDefaultSlots(), s.getAcceptsProOrders());
    }

    @Transactional
    public void updateMySettings(Long userId, ScheduleSettingsDTO dto) {
        Provider provider = requireProvider(userId);
        var s = getOrCreate(provider.getId());

        // ── Pro-orders enforcement — trial or lapsed/cancelled subscriptions
        // can never turn this on, regardless of what the client sends. ──────
        if (Boolean.TRUE.equals(dto.acceptsProOrders()) && !eligibilityChecker.isEligible(provider.getId())) {
            throw new BusinessException(
                    "Activate a paid subscription to accept Business & Pro orders.",
                    "SUBSCRIPTION_REQUIRED");
        }

        if (dto.workingDays() != null) s.setWorkingDays(dto.workingDays());
        if (dto.defaultSlots() != null) s.setDefaultSlots(dto.defaultSlots());
        if (dto.acceptsProOrders() != null) s.setAcceptsProOrders(dto.acceptsProOrders());
        repo.save(s);
    }

    private Provider requireProvider(Long userId) {
        return providerRepo.findByUser_Id(userId)
                .orElseThrow(() -> new IllegalStateException("No provider profile for this account."));
    }
}