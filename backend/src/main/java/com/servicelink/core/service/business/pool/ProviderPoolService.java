package com.servicelink.core.service.business.pool;

import com.servicelink.core.dto.response.business.pool.ProviderPoolCardDTO;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.provider.availability.ProviderScheduleSettings;
import com.servicelink.core.model.business.providerpool.ProviderPoolEntry;
import com.servicelink.core.model.business.providerpool.ProviderPoolStatus;
import com.servicelink.core.repository.business.ProviderPoolEntryRepository;
import com.servicelink.core.repository.provider.ProviderRepository;
import com.servicelink.core.repository.provider.availability.ProviderScheduleSettingsRepository;
import com.servicelink.core.service.provider.subscription.ProOrdersEligibilityChecker;
import com.servicelink.core.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProviderPoolService {

    private final ProviderPoolEntryRepository poolEntryRepository;
    private final ProviderRepository providerRepository;
    private final ProviderScheduleSettingsRepository scheduleSettingsRepository;
    private final ProOrdersEligibilityChecker proOrdersEligibilityChecker;

    // ────────────────────────────────────────────────────────────────────
    // ELIGIBILITY: The single source of truth for Pro Orders eligibility.
    //
    // checkProOrdersEligibility() is the canonical check — it returns the
    // *first* failing reason, if any. computeProOrdersEligible() is a thin
    // boolean wrapper for callers (directory filtering, card DTOs) that
    // only need yes/no. Any other service that needs to gate on Pro Orders
    // eligibility (e.g. ProviderScheduleSettingsService when saving the
    // "Accept Business & Pro Orders" toggle) should call
    // checkProOrdersEligibility() rather than re-deriving these conditions,
    // so there is exactly one place this rule can drift.
    // ────────────────────────────────────────────────────────────────────

    public enum EligibilityFailure {
        PROVIDER_INACTIVE("Your account must be active to accept Business & Pro orders."),
        VERIFICATION_REQUIRED("Complete KYC verification before accepting Business & Pro orders."),
        ONBOARDING_INCOMPLETE("Finish onboarding before accepting Business & Pro orders."),
        SUBSCRIPTION_REQUIRED("Activate a paid subscription to accept Business & Pro orders."),
        PRO_ORDERS_DISABLED("Turn on \"Accept Business & Pro Orders\" in your availability settings.");

        public final String message;

        EligibilityFailure(String message) {
            this.message = message;
        }
    }

    /**
     * Returns the first reason this provider is NOT eligible for Pro Orders,
     * or empty if they are fully eligible. Order matters: account-level gates
     * (active/verified/onboarding) are checked before subscription and
     * before the provider's own toggle, since those are the more fundamental
     * blockers a caller should surface first.
     */
    public Optional<EligibilityFailure> checkProOrdersEligibility(Provider provider) {
        if (!Boolean.TRUE.equals(provider.getIsActive())) {
            return Optional.of(EligibilityFailure.PROVIDER_INACTIVE);
        }
        if (!Boolean.TRUE.equals(provider.getIsVerified())) {
            return Optional.of(EligibilityFailure.VERIFICATION_REQUIRED);
        }
        if (!Boolean.TRUE.equals(provider.getHasCompletedOnboarding())) {
            return Optional.of(EligibilityFailure.ONBOARDING_INCOMPLETE);
        }
        if (!proOrdersEligibilityChecker.isEligible(provider.getId())) {
            return Optional.of(EligibilityFailure.SUBSCRIPTION_REQUIRED);
        }

        boolean acceptsProOrders = scheduleSettingsRepository.findById(provider.getId())
                .map(ProviderScheduleSettings::getAcceptsProOrders)
                .map(Boolean.TRUE::equals)
                .orElse(false);
        if (!acceptsProOrders) {
            return Optional.of(EligibilityFailure.PRO_ORDERS_DISABLED);
        }

        return Optional.empty();
    }

    public boolean computeProOrdersEligible(Provider provider) {
        return checkProOrdersEligibility(provider).isEmpty();
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

        Optional<EligibilityFailure> failure = checkProOrdersEligibility(provider);
        if (failure.isPresent()) {
            throw new BusinessException(failure.get().message, "PROVIDER_NOT_PRO_VISIBLE");
        }

        var existing = poolEntryRepository.findByOrganizationIdAndProviderId(organizationId, providerId);
        if (existing.isPresent()) {
            ProviderPoolEntry entry = existing.get();
            if (entry.getStatus() == ProviderPoolStatus.ACTIVE) {
                throw new BusinessException("Provider already exists in your pool", "DUPLICATE_POOL_ENTRY");
            }
            entry.setStatus(ProviderPoolStatus.ACTIVE);
            return toCard(poolEntryRepository.save(entry));
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

        // Keep membership history for Pro jobs, billing, and compliance. A later
        // add request reactivates this same row instead of creating a duplicate.
        entry.setStatus(ProviderPoolStatus.INACTIVE);
        poolEntryRepository.save(entry);
    }
}