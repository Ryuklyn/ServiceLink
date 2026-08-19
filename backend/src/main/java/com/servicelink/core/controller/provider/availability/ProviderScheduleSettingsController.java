package com.servicelink.core.controller.provider.availability;

import com.servicelink.core.dto.availability.ScheduleSettingsDTO;
import com.servicelink.core.model.user.User;
import com.servicelink.core.service.provider.availability.ProviderScheduleSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/providers/me/schedule-settings")
@RequiredArgsConstructor
public class ProviderScheduleSettingsController {

    private final ProviderScheduleSettingsService service;

    @GetMapping
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ScheduleSettingsDTO> get(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getMySettings(user.getId()));
    }

    @PutMapping
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Void> update(@AuthenticationPrincipal User user, @RequestBody ScheduleSettingsDTO dto) {
        service.updateMySettings(user.getId(), dto);
        return ResponseEntity.ok().build();
    }
}