package com.servicelink.core.controller.provider.availability;

import com.servicelink.core.dto.request.provider.availability.AvailabilityBulkUpdateRequestDTO;
import com.servicelink.core.dto.request.provider.availability.AvailabilitySlotUpdateDTO;
import com.servicelink.core.dto.response.provider.availability.AvailabilitySlotDTO;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.user.User;
import com.servicelink.core.repository.provider.ProviderRepository;
import com.servicelink.core.service.provider.availability.AvailabilityExceptionService;
import com.servicelink.core.service.provider.availability.AvailabilityResolverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/providers")
@RequiredArgsConstructor
public class ProviderAvailabilityController {

    private final AvailabilityResolverService resolver;
    private final AvailabilityExceptionService exceptionService;
    private final ProviderRepository providerRepo;

    @GetMapping("/me/availability")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<AvailabilitySlotDTO>> getMyAvailability(
            @AuthenticationPrincipal User user, @RequestParam LocalDate start, @RequestParam LocalDate end) {
        Long providerId = requireProviderId(user.getId());
        return ResponseEntity.ok(resolver.resolveRange(providerId, start, end, true));
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<List<AvailabilitySlotDTO>> getPublicAvailability(
            @PathVariable Long id, @RequestParam LocalDate start, @RequestParam LocalDate end) {
        return ResponseEntity.ok(resolver.resolveRange(id, start, end, false));
    }

    @PatchMapping("/me/availability")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Void> updateMyAvailability(
            @AuthenticationPrincipal User user, @Valid @RequestBody AvailabilityBulkUpdateRequestDTO request) {
        for (AvailabilitySlotUpdateDTO u : request.getUpdates()) {
            if (u.isAvailable()) {
                exceptionService.deleteCoveringException(user.getId(), u.getDate(), u.getPeriod());
            } else {
                exceptionService.createException(user.getId(), u.getDate(), u.getPeriod(), u.getReason());
            }
        }
        return ResponseEntity.ok().build();
    }

    private Long requireProviderId(Long userId) {
        Provider provider = providerRepo.findByUser_Id(userId)
                .orElseThrow(() -> new com.servicelink.core.exception.ResourceNotFoundException("No provider profile for this account."));
        return provider.getId();
    }
}