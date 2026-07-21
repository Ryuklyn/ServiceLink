package com.servicelink.core.service.provider.availability;

import com.servicelink.core.dto.request.provider.availability.AvailabilitySlotUpdateDTO;
import com.servicelink.core.dto.response.provider.availability.AvailabilitySlotDTO;
import com.servicelink.core.mapper.provider.availability.AvailabilityMapper;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.provider.availability.ProviderAvailabilitySlot;
import com.servicelink.core.repository.provider.ProviderRepository;
import com.servicelink.core.repository.provider.availability.ProviderAvailabilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProviderAvailabilityService {

    private final ProviderAvailabilityRepository availabilityRepo;
    private final ProviderRepository providerRepo;
    private final AvailabilityMapper mapper;

    // ── Provider's own view ──────────────────────────────────────────────
    // Returns only rows that exist (exceptions to "available by default").
    // The frontend fills in every date/period NOT present as available=true.
    @Transactional(readOnly = true)
    public List<AvailabilitySlotDTO> getMyAvailability(Long userId, LocalDate start, LocalDate end) {
        Provider provider = requireProvider(userId);
        return availabilityRepo.findByProvider_IdAndDateBetween(provider.getId(), start, end)
                .stream()
                .map(mapper::toOwnerDto)
                .toList();
    }

    @Transactional
    public void updateMyAvailability(Long userId, List<AvailabilitySlotUpdateDTO> updates) {
        Provider provider = requireProvider(userId);

        for (AvailabilitySlotUpdateDTO u : updates) {
            ProviderAvailabilitySlot slot = availabilityRepo
                    .findByProvider_IdAndDateAndPeriod(provider.getId(), u.getDate(), u.getPeriod())
                    .orElseGet(() -> ProviderAvailabilitySlot.builder()
                            .provider(provider)
                            .date(u.getDate())
                            .period(u.getPeriod())
                            .build());

            slot.setIsAvailable(u.isAvailable());
            slot.setReason(u.isAvailable() ? null : u.getReason());
            availabilityRepo.save(slot);
        }
    }

    // ── Public/customer view ───────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<AvailabilitySlotDTO> getPublicAvailability(Long providerId, LocalDate start, LocalDate end) {
        return availabilityRepo.findByProvider_IdAndDateBetween(providerId, start, end)
                .stream()
                .map(mapper::toPublicDto)
                .toList();
    }

    private Provider requireProvider(Long userId) {
        return providerRepo.findByUser_Id(userId)
                .orElseThrow(() -> new IllegalStateException("No provider profile for this account."));
    }
}