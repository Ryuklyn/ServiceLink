package com.servicelink.core.controller.provider.subscription;

import com.servicelink.core.dto.response.provider.subscription.SubscriptionStatusDTO;
import com.servicelink.core.exception.ResourceNotFoundException;
import com.servicelink.core.model.user.User;
import com.servicelink.core.repository.provider.ProviderRepository;
import com.servicelink.core.service.provider.subscription.ProviderSubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/providers/me/subscription")
@RequiredArgsConstructor
public class ProviderSubscriptionController {

    private final ProviderSubscriptionService subscriptionService;
    private final ProviderRepository providerRepo;

    @GetMapping
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<SubscriptionStatusDTO> getMySubscription(@AuthenticationPrincipal User user) {
        Long providerId = providerRepo.findByUser_Id(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider for user", user.getId()))
                .getId();
        return ResponseEntity.ok(subscriptionService.getStatus(providerId));
    }
}
