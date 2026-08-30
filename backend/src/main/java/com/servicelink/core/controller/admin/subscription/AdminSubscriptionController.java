package com.servicelink.core.controller.admin.subscription;

import com.servicelink.core.dto.request.admin.subscription.ExtendSubscriptionRequest;
import com.servicelink.core.dto.request.admin.subscription.RevokeSubscriptionRequest;
import com.servicelink.core.dto.response.admin.subscription.AdminSubscriptionRowDTO;
import com.servicelink.core.dto.response.admin.subscription.PagedResponseDTO;
import com.servicelink.core.dto.response.admin.subscription.SubscriptionHistoryDTO;
import com.servicelink.core.dto.response.admin.subscription.SubscriptionStatsDTO;
import com.servicelink.core.model.provider.subscription.SubscriptionPlanType;
import com.servicelink.core.model.provider.subscription.SubscriptionStatus;
import com.servicelink.core.service.provider.subscription.ProviderSubscriptionService;
import com.servicelink.core.service.business.SubscriptionService;
import com.servicelink.core.dto.response.admin.subscription.ProSubscriptionStatsDTO;
import com.servicelink.core.dto.response.admin.subscription.ProAdminSubscriptionRowDTO;
import com.servicelink.core.dto.response.admin.subscription.ProSubscriptionHistoryDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Backs the admin "Subscription Management" page — distinct from
 * ProviderSubscriptionController, which is the provider-facing
 * /api/providers/me/subscription/* surface.
 * <p>
 * hasRole('ADMIN') here is defense-in-depth alongside the existing URL-level
 * rule in SecurityConfig ({@code .requestMatchers("/api/admin/**").hasRole("ADMIN")}),
 * matching the pattern already used on the categories/catalog admin
 * endpoints.
 */
@RestController
@RequestMapping("/api/admin/subscriptions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSubscriptionController {

    private final ProviderSubscriptionService subscriptionService;
    private final SubscriptionService proSubscriptionService;

    @GetMapping("/stats")
    public ResponseEntity<SubscriptionStatsDTO> getStats() {
        return ResponseEntity.ok(subscriptionService.adminGetStats());
    }

    @GetMapping
    public ResponseEntity<PagedResponseDTO<AdminSubscriptionRowDTO>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) SubscriptionStatus status,
            @RequestParam(required = false) SubscriptionPlanType planType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        return ResponseEntity.ok(
                subscriptionService.adminSearch(status, planType, search, page, size)
        );
    }

    @GetMapping("/{providerId}/history")
    public ResponseEntity<SubscriptionHistoryDTO> getHistory(@PathVariable Long providerId) {
        return ResponseEntity.ok(subscriptionService.adminGetHistory(providerId));
    }

    @PostMapping("/{providerId}/extend")
    public ResponseEntity<AdminSubscriptionRowDTO> extend(
            @PathVariable Long providerId,
            @RequestBody @Valid ExtendSubscriptionRequest req
    ) {
        return ResponseEntity.ok(subscriptionService.adminExtend(providerId, req));
    }

    @PostMapping("/{providerId}/revoke")
    public ResponseEntity<AdminSubscriptionRowDTO> revoke(
            @PathVariable Long providerId,
            @RequestBody @Valid RevokeSubscriptionRequest req
    ) {
        return ResponseEntity.ok(subscriptionService.adminRevoke(providerId, req));
    }

    @GetMapping("/pro/stats")
    public ResponseEntity<ProSubscriptionStatsDTO> getProStats() {
        return ResponseEntity.ok(proSubscriptionService.getProStats());
    }

    @GetMapping("/pro")
    public ResponseEntity<java.util.List<ProAdminSubscriptionRowDTO>> getProSubscriptions() {
        return ResponseEntity.ok(proSubscriptionService.getProSubscriptions());
    }

    @GetMapping("/pro/{workspaceId}/history")
    public ResponseEntity<ProSubscriptionHistoryDTO> getProHistory(@PathVariable Long workspaceId) {
        return ResponseEntity.ok(proSubscriptionService.getProSubscriptionHistory(workspaceId));
    }

    @PostMapping("/pro/{workspaceId}/cancel")
    public ResponseEntity<ProAdminSubscriptionRowDTO> cancelPro(@PathVariable Long workspaceId) {
        return ResponseEntity.ok(proSubscriptionService.cancelProSubscription(workspaceId));
    }

    @PostMapping("/pro/{workspaceId}/extend")
    public ResponseEntity<ProAdminSubscriptionRowDTO> extendPro(
            @PathVariable Long workspaceId,
            @RequestParam int days
    ) {
        return ResponseEntity.ok(proSubscriptionService.extendProSubscription(workspaceId, days));
    }

    // NOTE: no /transactions endpoint wired up yet — the frontend's Payment
    // Audit Log tab (adminSubscriptionApi.listTransactions) needs an
    // admin-wide, paged, filterable transaction list, which means either a
    // new PaymentTransactionRepository query or a new method on whatever
    // PaymentService already backs ProviderSubscriptionController's
    // getTransactions(). I don't have that class's source, so I've left this
    // endpoint out rather than guess its shape. Paste PaymentService (or
    // PaymentTransactionRepository) and I'll wire it in properly.
}