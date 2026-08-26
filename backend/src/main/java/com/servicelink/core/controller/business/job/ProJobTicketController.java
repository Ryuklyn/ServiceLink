package com.servicelink.core.controller.business.job;

import com.servicelink.core.dto.request.business.job.CreateProJobTicketRequest;
import com.servicelink.core.dto.response.business.job.*;
import com.servicelink.core.model.business.job.ProJobStatus;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.user.User;
import com.servicelink.core.repository.provider.ProviderRepository;
import com.servicelink.core.security.CurrentOrganization;
import com.servicelink.core.service.business.BusinessAuthorizationService;
import com.servicelink.core.service.business.job.ProJobTicketService;
import com.servicelink.core.exception.BusinessException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/pro/jobs")
public class ProJobTicketController {

    private final ProJobTicketService jobService;
    private final BusinessAuthorizationService authorizationService;
    private final ProviderRepository providerRepository;

    @PostMapping
    public ResponseEntity<ProJobTicketResponse> create(
            @CurrentOrganization Long organizationId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateProJobTicketRequest request
    ) {
        authorizationService.requireRole(user, organizationId, java.util.Set.of(
                com.servicelink.core.model.business.TeamRole.ADMIN,
                com.servicelink.core.model.business.TeamRole.MANAGER,
                com.servicelink.core.model.business.TeamRole.STAFF
        ));
        return ResponseEntity.status(HttpStatus.CREATED).body(jobService.create(organizationId, user, request));
    }

    @GetMapping
    public Page<ProJobTicketResponse> list(
            @CurrentOrganization Long organizationId,
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) ProJobStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        authorizationService.requireDirectoryAccess(user, organizationId);
        return jobService.list(organizationId, status, PageRequest.of(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProJobDetailResponse> getDetails(
            @CurrentOrganization Long organizationId,
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        authorizationService.requireDirectoryAccess(user, organizationId);
        return ResponseEntity.ok(jobService.getDetails(organizationId, id));
    }

    @GetMapping("/{id}/eligible-providers")
    public ResponseEntity<List<ProEligibleProviderResponse>> getEligibleProviders(
            @CurrentOrganization Long organizationId,
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        authorizationService.requireDirectoryAccess(user, organizationId);
        return ResponseEntity.ok(jobService.getEligibleProviders(organizationId, id));
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<Void> assignProvider(
            @CurrentOrganization Long organizationId,
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestParam Long providerId
    ) {
        authorizationService.requireRole(user, organizationId, java.util.Set.of(
                com.servicelink.core.model.business.TeamRole.ADMIN,
                com.servicelink.core.model.business.TeamRole.MANAGER
        ));
        jobService.assignProvider(organizationId, id, providerId, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/unassign")
    public ResponseEntity<Void> unassignProvider(
            @CurrentOrganization Long organizationId,
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestParam Long providerId
    ) {
        authorizationService.requireRole(user, organizationId, java.util.Set.of(
                com.servicelink.core.model.business.TeamRole.ADMIN,
                com.servicelink.core.model.business.TeamRole.MANAGER
        ));
        jobService.unassignProvider(organizationId, id, providerId, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/check-in")
    public ResponseEntity<Void> checkIn(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam String qrCode
    ) {
        Provider provider = providerRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new BusinessException("Only registered providers can check-in to Pro jobs", "PROVIDER_PROFILE_REQUIRED"));
        jobService.checkInProvider(id, provider.getId(), latitude, longitude, qrCode);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Void> complete(
            @CurrentOrganization Long organizationId,
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        authorizationService.requireRole(user, organizationId, java.util.Set.of(
                com.servicelink.core.model.business.TeamRole.ADMIN,
                com.servicelink.core.model.business.TeamRole.MANAGER,
                com.servicelink.core.model.business.TeamRole.STAFF
        ));
        jobService.completeJob(organizationId, id, user);
        return ResponseEntity.ok().build();
    }

    // ────────────────────────────────────────────────────────────────────
    // DASHBOARD ENDPOINTS
    // ────────────────────────────────────────────────────────────────────

    @GetMapping("/kpi-dashboard")
    public ResponseEntity<ProKpiDashboardResponse> getKpiDashboard(
            @CurrentOrganization Long organizationId,
            @AuthenticationPrincipal User user
    ) {
        authorizationService.requireRole(user, organizationId, java.util.Set.of(
                com.servicelink.core.model.business.TeamRole.ADMIN,
                com.servicelink.core.model.business.TeamRole.MANAGER,
                com.servicelink.core.model.business.TeamRole.STAFF,
                com.servicelink.core.model.business.TeamRole.FINANCE
        ));
        return ResponseEntity.ok(jobService.getKpiDashboard(organizationId));
    }

    @GetMapping("/sla-dashboard")
    public ResponseEntity<ProSlaDashboardResponse> getSlaDashboard(
            @CurrentOrganization Long organizationId,
            @AuthenticationPrincipal User user
    ) {
        authorizationService.requireRole(user, organizationId, java.util.Set.of(
                com.servicelink.core.model.business.TeamRole.ADMIN,
                com.servicelink.core.model.business.TeamRole.MANAGER,
                com.servicelink.core.model.business.TeamRole.STAFF
        ));
        return ResponseEntity.ok(jobService.getSlaDashboard(organizationId));
    }

    @GetMapping("/billing-dashboard")
    public ResponseEntity<ProBillingDashboardResponse> getBillingDashboard(
            @CurrentOrganization Long organizationId,
            @AuthenticationPrincipal User user
    ) {
        authorizationService.requireRole(user, organizationId, java.util.Set.of(
                com.servicelink.core.model.business.TeamRole.ADMIN,
                com.servicelink.core.model.business.TeamRole.FINANCE
        ));
        return ResponseEntity.ok(jobService.getBillingDashboard(organizationId));
    }

    @GetMapping("/compliance-dashboard")
    public ResponseEntity<ProComplianceDashboardResponse> getComplianceDashboard(
            @CurrentOrganization Long organizationId,
            @AuthenticationPrincipal User user
    ) {
        authorizationService.requireRole(user, organizationId, java.util.Set.of(
                com.servicelink.core.model.business.TeamRole.ADMIN,
                com.servicelink.core.model.business.TeamRole.MANAGER,
                com.servicelink.core.model.business.TeamRole.FINANCE
        ));
        return ResponseEntity.ok(jobService.getComplianceDashboard(organizationId));
    }

    @GetMapping("/provider/assigned")
    public ResponseEntity<List<ProJobTicketResponse>> getProviderJobs(
            @AuthenticationPrincipal User user
    ) {
        Provider provider = providerRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new BusinessException("Only registered providers can view assigned Pro jobs", "PROVIDER_PROFILE_REQUIRED"));
        return ResponseEntity.ok(jobService.getProviderJobs(provider.getId()));
    }
}
