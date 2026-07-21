package com.servicelink.core.controller.provider.availability;

import com.servicelink.core.dto.request.provider.availability.AvailabilityBulkUpdateRequestDTO;
import com.servicelink.core.dto.response.provider.availability.AvailabilitySlotDTO;
import com.servicelink.core.model.user.User;
import com.servicelink.core.service.provider.availability.ProviderAvailabilityService;
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

    private final ProviderAvailabilityService availabilityService;

    /** GET /api/providers/me/availability?start=2026-07-01&end=2026-07-31 */
    @GetMapping("/me/availability")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<AvailabilitySlotDTO>> getMyAvailability(
            @AuthenticationPrincipal User user,
            @RequestParam LocalDate start,
            @RequestParam LocalDate end) {
        return ResponseEntity.ok(availabilityService.getMyAvailability(user.getId(), start, end));
    }

    /** PATCH /api/providers/me/availability */
    @PatchMapping("/me/availability")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Void> updateMyAvailability(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AvailabilityBulkUpdateRequestDTO request) {
        availabilityService.updateMyAvailability(user.getId(), request.getUpdates());
        return ResponseEntity.ok().build();
    }

    /** GET /api/providers/{id}/availability?start=...&end=... — public, feeds the customer booking calendar */
    @GetMapping("/{id}/availability")
    public ResponseEntity<List<AvailabilitySlotDTO>> getPublicAvailability(
            @PathVariable Long id,
            @RequestParam LocalDate start,
            @RequestParam LocalDate end) {
        return ResponseEntity.ok(availabilityService.getPublicAvailability(id, start, end));
    }
}