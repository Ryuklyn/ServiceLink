package com.servicelink.core.service.business.pool;

import com.servicelink.core.dto.response.business.pool.ProviderPoolCardDTO;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.provider.availability.ProviderScheduleSettings;
import com.servicelink.core.model.provider.subscription.ProviderSubscription;
import com.servicelink.core.model.provider.subscription.SubscriptionPlanType;
import com.servicelink.core.model.provider.subscription.SubscriptionStatus;
import com.servicelink.core.model.business.providerpool.ProviderPoolEntry;
import com.servicelink.core.model.business.providerpool.ProviderPoolStatus;
import com.servicelink.core.repository.business.ProviderPoolEntryRepository;
import com.servicelink.core.repository.provider.ProviderRepository;
import com.servicelink.core.repository.provider.availability.ProviderScheduleSettingsRepository;
import com.servicelink.core.repository.provider.subscription.ProviderSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProviderPoolService {

    private final ProviderPoolEntryRepository poolEntryRepository;
    private final ProviderRepository providerRepository;
    private final ProviderSubscriptionRepository providerSubscriptionRepository;
    private final ProviderScheduleSettingsRepository scheduleSettingsRepository;

    // ────────────────────────────────────────────────────────────────────
    // ELIGIBILITY: The single source of truth for Pro Orders eligibility
    // ────────────────────────────────────────────────────────────────────

    public boolean computeProOrdersEligible(Provider provider) {
        boolean paidAndActive = providerSubscriptionRepository.findByProvider_Id(provider.getId())
                .map(this::isPaidAndActive)
                .orElse(false);

        boolean acceptsProOrders = scheduleSettingsRepository.findById(provider.getId())
                .map(ProviderScheduleSettings::getAcceptsProOrders)
                .map(Boolean.TRUE::equals)
                .orElse(false);

        return paidAndActive && acceptsProOrders;
    }

    private boolean isPaidAndActive(ProviderSubscription sub) {
        return sub.getPlanType() != SubscriptionPlanType.FREE_TRIAL
                && sub.getStatus() == SubscriptionStatus.ACTIVE
                && sub.isCurrentlyActive();
    }

    // ────────────────────────────────────────────────────────────────────
    // LISTING
    // ────────────────────────────────────────────────────────────────────

    public List<ProviderPoolCardDTO> listForOrganization(
            Long organizationId,
            ProviderPoolStatus status,
            String search
    ) {
        List<ProviderPoolEntry> entries = (status == null)
                ? poolEntryRepository.findAllByOrganizationId(organizationId)
                : poolEntryRepository.findAllByOrganizationIdAndStatus(organizationId, status);

        return entries.stream()
                .map(this::toCard)
                .filter(card -> matchesSearch(card, search))
                .toList();
    }

    private boolean matchesSearch(ProviderPoolCardDTO card, String search) {
        if (search == null || search.isBlank()) return true;
        String q = search.toLowerCase();
        return (card.getFullName() != null && card.getFullName().toLowerCase().contains(q))
                || (card.getPrimaryCategoryName() != null && card.getPrimaryCategoryName().toLowerCase().contains(q))
                || (card.getBusinessName() != null && card.getBusinessName().toLowerCase().contains(q));
    }

    private ProviderPoolCardDTO toCard(ProviderPoolEntry entry) {
        Provider provider = entry.getProvider();

        Integer jobs = entry.getProJobsCompleted();
        boolean hasHistory = jobs != null && jobs > 0;

        return ProviderPoolCardDTO.builder()
                .poolEntryId(entry.getId())
                .providerId(provider.getId())
                .fullName(provider.getFullName())
                .businessName(provider.getBusinessName())
                .primaryCategoryName(provider.getPrimaryCategoryName())
                .profilePictureUrl(provider.getProfilePictureUrl())
                .averageRating(provider.getAverageRating())
                .proJobsCompleted(jobs)
                .attendanceRate(hasHistory ? entry.getAttendanceRate() : null)
                .onTimeRate(hasHistory ? entry.getOnTimeRate() : null)
                .isVerified(Boolean.TRUE.equals(provider.getIsVerified()))
                .proOrdersEligible(computeProOrdersEligible(provider))
                .poolStatus(entry.getStatus())
                .build();
    }

    // ────────────────────────────────────────────────────────────────────
    // ADD (from Provider Directory)
    // ────────────────────────────────────────────────────────────────────

    public ProviderPoolCardDTO addToPool(Long organizationId, Long providerId) {
        if (organizationId == null) {
            throw new IllegalArgumentException("Organization ID cannot be null");
        }

        Provider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new IllegalArgumentException("Provider not found with ID: " + providerId));

        if (!computeProOrdersEligible(provider)) {
            throw new IllegalStateException("Provider is not eligible for Pro Orders");
        }

        if (poolEntryRepository.existsByOrganizationIdAndProviderId(organizationId, providerId)) {
            throw new IllegalStateException("Provider already exists in your pool");
        }

        ProviderPoolEntry entry = ProviderPoolEntry.builder()
                .organizationId(organizationId)
                .provider(provider)
                .status(ProviderPoolStatus.ACTIVE)
                .proJobsCompleted(0)
                .addedAt(Instant.now())
                .build();

        ProviderPoolEntry saved = poolEntryRepository.save(entry);
        return toCard(saved);
    }

    // ────────────────────────────────────────────────────────────────────
    // REMOVE
    // ────────────────────────────────────────────────────────────────────

    public void removeFromPool(Long organizationId, Long poolEntryId) {
        ProviderPoolEntry entry = poolEntryRepository.findByIdAndOrganizationId(poolEntryId, organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Pool entry not found or belongs to another organization"));

        poolEntryRepository.delete(entry);
    }
}