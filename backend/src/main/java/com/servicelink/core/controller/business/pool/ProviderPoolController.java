package com.servicelink.core.controller.business.pool;

import com.servicelink.core.dto.response.business.pool.ProviderPoolCardDTO;
import com.servicelink.core.model.business.providerpool.ProviderPoolStatus;
import com.servicelink.core.security.CurrentOrganization;
import com.servicelink.core.service.business.pool.ProviderPoolService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/pro/provider-pool")
public class ProviderPoolController {

    private final ProviderPoolService providerPoolService;

    /**
     * GET /api/pro/provider-pool?status=ACTIVE&search=ram
     * List all pool entries for the authenticated organization.
     */
    @GetMapping
    public List<ProviderPoolCardDTO> list(
            @CurrentOrganization Long organizationId,
            @RequestParam(required = false) ProviderPoolStatus status,
            @RequestParam(required = false) String search
    ) {
        return providerPoolService.listForOrganization(organizationId, status, search);
    }

    /**
     * POST /api/pro/provider-pool/{providerId}
     * Add a provider picked from the Directory to the organization's pool.
     */
    @PostMapping("/{providerId}")
    public ProviderPoolCardDTO add(
            @CurrentOrganization Long organizationId,
            @PathVariable Long providerId
    ) {
        return providerPoolService.addToPool(organizationId, providerId);
    }

    /**
     * DELETE /api/pro/provider-pool/{poolEntryId}
     * Remove a provider from the organization's pool.
     */
    @DeleteMapping("/{poolEntryId}")
    public void remove(
            @CurrentOrganization Long organizationId,
            @PathVariable Long poolEntryId
    ) {
        providerPoolService.removeFromPool(organizationId, poolEntryId);
    }
}