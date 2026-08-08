package com.servicelink.core.repository.appointment;

import com.servicelink.core.model.provider.ServiceCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceCatalogRepository extends JpaRepository<ServiceCatalog, Long> {

    // ── User-facing browsing ──────────────────────────────────────────────────

    /**
     * Active sub-services for a category, sorted alphabetically.
     * Shown to users on the service selection screen before picking a provider.
     */
    List<ServiceCatalog> findByCategory_IdAndIsActiveTrueOrderBySubServiceNameAsc(
            Long categoryId);

    /**
     * All active sub-services across all categories, sorted by category then name.
     * Used for user-facing full catalog display.
     */
    List<ServiceCatalog> findByIsActiveTrueOrderByCategory_NameAscSubServiceNameAsc();

    Optional<ServiceCatalog> findByIdAndIsActiveTrue(Long id);

    // ── Admin operations ──────────────────────────────────────────────────────

    /**
     * Duplicate prevention before admin creates a new sub-service entry.
     * Case-insensitive so "Ceiling Fan Installation" and
     * "ceiling fan installation" are treated as the same entry within a category.
     */
    boolean existsByCategory_IdAndSubServiceNameIgnoreCase(
            Long categoryId, String subServiceName);

    /**
     * ALL sub-services (active + inactive) sorted by category then name.
     * Used by the admin catalog management page — unlike the user-facing
     * query above, this must include inactive items so admins can see and
     * re-activate them.
     */
    List<ServiceCatalog> findAllByOrderByCategory_NameAscSubServiceNameAsc();

    /** Sub-service count per category, shown on the admin category cards. */
    long countByCategory_Id(Long categoryId);
}