package com.servicelink.core.service.provider.availability;

import com.servicelink.core.dto.availability.ScheduleSettingsDTO;
import com.servicelink.core.exception.BusinessException;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.provider.availability.ProviderScheduleSettings;
import com.servicelink.core.repository.provider.ProviderRepository;
import com.servicelink.core.repository.provider.availability.ProviderScheduleSettingsRepository;
import com.servicelink.core.service.business.pool.ProviderPoolService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class ProviderScheduleSettingsService {

    private final ProviderScheduleSettingsRepository repo;
    private final ProviderRepository providerRepo;
    private final ProviderPoolService providerPoolService;

    @Transactional
    public ProviderScheduleSettings getOrCreate(Long providerId) {
        return repo.findById(providerId).orElseGet(() -> {
            // The settings and availability requests are fired together on
            // page load. Locking the owning Provider makes first-time default
            // creation safe when those requests arrive concurrently.
            Provider provider = providerRepo.findByIdForUpdate(providerId)
                    .orElseThrow(() -> new IllegalStateException("Provider profile not found."));
            return repo.findById(providerId).orElseGet(() ->
                    repo.saveAndFlush(ProviderScheduleSettings.builder()
                            .provider(provider)
                            .providerId(providerId)
                            .build()));
        });
    }

    // This GET may create default settings for a newly-approved provider, so
    // it must not run in a read-only transaction.
    @Transactional
    public ScheduleSettingsDTO getMySettings(Long userId) {
        Provider provider = requireProvider(userId);
        var s = getOrCreate(provider.getId());
        return new ScheduleSettingsDTO(s.getWorkingDays(), s.getDefaultSlots(), s.getAcceptsProOrders());
    }

    @Transactional
    public void updateMySettings(Long userId, ScheduleSettingsDTO dto) {
        Provider provider = requireProvider(userId);
        var s = getOrCreate(provider.getId());

        // ── Pro-orders enforcement ──────────────────────────────────────
        // Delegates to ProviderPoolService.checkProOrdersEligibility, the
        // single source of truth also used by the directory listing and by
        // addToPool. This check intentionally ignores the *current* value
        // of s.getAcceptsProOrders() (which is about to be overwritten by
        // dto.acceptsProOrders() below) — PRO_ORDERS_DISABLED as a reason
        // from that method would be misleading here, so we only care about
        // the account/verification/subscription gates when someone is
        // trying to turn the toggle ON.
        if (Boolean.TRUE.equals(dto.acceptsProOrders())) {
            Optional<ProviderPoolService.EligibilityFailure> failure =
                    providerPoolService.checkProOrdersEligibility(provider)
                            .filter(f -> f != ProviderPoolService.EligibilityFailure.PRO_ORDERS_DISABLED);
            if (failure.isPresent()) {
                throw new BusinessException(failure.get().message, failure.get().name());
            }
        }

        if (dto.workingDays() != null) {
            if (dto.workingDays().stream().anyMatch(day -> day == null || day < 0 || day > 6)) {
                throw new IllegalArgumentException("Working days must be between Sunday (0) and Saturday (6)");
            }
            s.getWorkingDays().clear();
            s.getWorkingDays().addAll(new HashSet<>(dto.workingDays()));
        }
        if (dto.defaultSlots() != null) {
            if (dto.defaultSlots().stream().anyMatch(slot -> slot == null)) {
                throw new IllegalArgumentException("Default time slots cannot contain an empty value");
            }
            s.getDefaultSlots().clear();
            s.getDefaultSlots().addAll(new HashSet<>(dto.defaultSlots()));
        }
        if (dto.acceptsProOrders() != null) s.setAcceptsProOrders(dto.acceptsProOrders());
        repo.save(s);
    }

    private Provider requireProvider(Long userId) {
        return providerRepo.findByUser_Id(userId)
                .orElseThrow(() -> new com.servicelink.core.exception.ResourceNotFoundException("Provider profile not found for this account."));
    }
}
