package com.servicelink.core.repository.appointment;

import com.servicelink.core.model.common.ServiceCategory;
import com.servicelink.core.model.provider.ServiceCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceCatalogRepository extends JpaRepository<ServiceCatalog, Long> {

    // ── User-facing browsing ──────────────────────────────────────────────────

    /**
     * Active sub-services for a category, sorted alphabetically.
     * Shown to users on the service selection screen before picking a provider.
     */
    List<ServiceCatalog> findByCategoryAndIsActiveTrueOrderBySubServiceNameAsc(
            ServiceCategory category);

    /**
     * All active sub-services across all categories, sorted by category then name.
     * Used for admin overview and home screen full catalog display.
     */
    List<ServiceCatalog> findByIsActiveTrueOrderByCategoryAscSubServiceNameAsc();

    // ── Admin operations ──────────────────────────────────────────────────────

    /**
     * Duplicate prevention before admin creates a new sub-service entry.
     * Case-insensitive so "Ceiling Fan Installation" and
     * "ceiling fan installation" are treated as the same entry.
     * Call this in AdminService.createSubService() before saving.
     */
    boolean existsByCategoryAndSubServiceNameIgnoreCase(
            ServiceCategory category, String subServiceName);
}
