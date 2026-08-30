package com.servicelink.core.controller.provider;

import com.servicelink.core.dto.response.provider.ProviderAnalyticsResponseDTO;
import com.servicelink.core.dto.response.provider.ProviderEarningsResponseDTO;
import com.servicelink.core.model.user.User;
import com.servicelink.core.service.provider.ProviderInsightsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/providers")
@RequiredArgsConstructor
public class ProviderInsightsController {

    private final ProviderInsightsService providerInsightsService;

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ProviderAnalyticsResponseDTO> getAnalytics(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "This Month") String range) {
        return ResponseEntity.ok(providerInsightsService.getAnalytics(user.getId(), range));
    }

    @GetMapping("/earnings")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ProviderEarningsResponseDTO> getEarnings(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "This Month") String range) {
        return ResponseEntity.ok(providerInsightsService.getEarnings(user.getId(), range));
    }
}
