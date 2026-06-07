package com.servicelink.core.controller.provider;

import com.servicelink.core.dto.request.provider.CreateProviderServiceDTO;
import com.servicelink.core.dto.request.provider.CreateServiceCatalogDTO;
import com.servicelink.core.dto.request.provider.UpdateProviderServiceDTO;
import com.servicelink.core.dto.response.provider.ProviderServiceDTO;
import com.servicelink.core.dto.response.provider.ServiceCatalogDTO;
import com.servicelink.core.service.provider.ProviderProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/providers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProviderController {

    private final ProviderProfileService providerProfileService;

    // ─────────────────────────────────────────────────────────────────────────
    // SERVICE CATALOG CRUD
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/admin/providers/catalog
     * Create a new sub-service entry in the catalog.
     *
     * Body: { category, subServiceName, defaultDuration, pricingUnit, basePrice }
     */
    @PostMapping("/catalog")
    public ResponseEntity<ServiceCatalogDTO> createCatalogItem(
            @Valid @RequestBody CreateServiceCatalogDTO req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(providerProfileService.createCatalogItem(req));
    }

    /**
     * PATCH /api/admin/providers/catalog/{id}/toggle
     * Soft-delete or re-activate a catalog item.
     */
    @PatchMapping("/catalog/{id}/toggle")
    public ResponseEntity<ServiceCatalogDTO> toggleCatalog(@PathVariable Long id) {
        return ResponseEntity.ok(providerProfileService.toggleCatalogActive(id));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PROVIDER-SERVICE MAPPINGS CRUD
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/admin/providers/{providerId}/services
     * All services (including unavailable) for a provider.
     */
    @GetMapping("/{providerId}/services")
    public ResponseEntity<List<ProviderServiceDTO>> getProviderServices(
            @PathVariable Long providerId) {

        return ResponseEntity.ok(providerProfileService.getServicesForProvider(providerId));
    }

    /**
     * POST /api/admin/providers/{providerId}/services
     * Add a catalog sub-service to a provider's offering list.
     *
     * Body: { catalogId, customPrice, customDuration?, isAvailable? }
     */
    @PostMapping("/{providerId}/services")
    public ResponseEntity<ProviderServiceDTO> addServiceToProvider(
            @PathVariable Long providerId,
            @Valid @RequestBody CreateProviderServiceDTO req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(providerProfileService.addServiceToProvider(providerId, req));
    }

    /**
     * PATCH /api/admin/providers/services/{providerServiceId}
     * Update price, duration, or availability of a provider-service mapping.
     *
     * Body: { customPrice?, customDuration?, isAvailable? }
     */
    @PatchMapping("/services/{providerServiceId}")
    public ResponseEntity<ProviderServiceDTO> updateProviderService(
            @PathVariable Long providerServiceId,
            @Valid @RequestBody UpdateProviderServiceDTO req) {

        return ResponseEntity.ok(
                providerProfileService.updateProviderService(providerServiceId, req));
    }

    /**
     * DELETE /api/admin/providers/services/{providerServiceId}
     * Remove a provider-service mapping entirely.
     */
    @DeleteMapping("/services/{providerServiceId}")
    public ResponseEntity<Void> deleteProviderService(@PathVariable Long providerServiceId) {
        providerProfileService.deleteProviderService(providerServiceId);
        return ResponseEntity.noContent().build();
    }
}