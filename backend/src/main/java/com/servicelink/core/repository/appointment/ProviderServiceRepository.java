package com.servicelink.core.repository.appointment;

import com.servicelink.core.model.common.ServiceCategory;
import com.servicelink.core.model.provider.ProviderService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProviderServiceRepository extends JpaRepository<ProviderService, Long> {

    // ── Provider-scoped fetches ───────────────────────────────────────────────

    /**
     * All services for a provider regardless of availability.
     * Used on the provider's own settings screen to show everything
     * including toggled-off services.
     * Field is `provider` (@ManyToOne), so underscore traversal is required.
     */
    List<ProviderService> findByProvider_Id(Long providerId);

    /**
     * Only available services — used for public-facing profile display
     * and booking flow service selection.
     */
    List<ProviderService> findByProvider_IdAndIsAvailableTrue(Long providerId);

    /**
     * Services for a provider filtered by category — used when grouping
     * services by category on the profile page.
     * JOIN FETCH prevents a secondary lazy load on catalogItem.
     */
    @Query("""
            SELECT ps FROM ProviderService ps
            JOIN FETCH ps.catalogItem c
            WHERE ps.provider.id = :providerId
              AND c.category = :category
              AND ps.isAvailable = true
            """)
    List<ProviderService> findByProviderAndCategory(
            @Param("providerId") Long providerId,
            @Param("category") ServiceCategory category);

    // ── Booking resolution ────────────────────────────────────────────────────

    /**
     * Resolves the ProviderService for a provider + catalog item combination.
     * Called during booking creation to get customPrice and effectiveDuration.
     * JOIN FETCH on catalogItem avoids a lazy load when price calculation runs.
     *
     * Do NOT use a derived query here — findByProviderIdAndCatalogItemId will
     * fail at startup because the field is `catalogItem` (object), not a scalar.
     */
    @Query("""
            SELECT ps FROM ProviderService ps
            JOIN FETCH ps.catalogItem
            WHERE ps.provider.id = :providerId
              AND ps.catalogItem.id = :catalogId
            """)
    Optional<ProviderService> findByProviderIdAndCatalogId(
            @Param("providerId") Long providerId,
            @Param("catalogId") Long catalogId);

    @Query("""
            SELECT ps FROM ProviderService ps
            JOIN FETCH ps.catalogItem
            WHERE ps.provider.id = :providerId
              AND ps.catalogItem.id = :catalogId
              AND ps.isAvailable = true
            """)
    Optional<ProviderService> findAvailableByProviderAndCatalog(
            @Param("providerId") Long providerId,
            @Param("catalogId") Long catalogId);

    // ── Catalog-item-scoped fetches ───────────────────────────────────────────

    /**
     * All active ProviderService rows for a specific catalog item.
     * Returns ProviderService (carries customPrice) rather than Provider.
     * Used to show "Provider Name — X NPR" on a sub-service detail screen.
     * JOIN FETCH on provider avoids N+1 when iterating to build the listing.
     */
    @Query("""
            SELECT ps FROM ProviderService ps
            JOIN FETCH ps.provider p
            WHERE ps.catalogItem.id = :catalogItemId
              AND ps.isAvailable = true
              AND p.isActive = true
            """)
    List<ProviderService> findAvailableProvidersForCatalogItem(
            @Param("catalogItemId") Long catalogItemId);

    /**
     * All provider-service mappings for a category system-wide.
     * Used for admin analytics: "how many providers offer ELECTRICIAN services."
     * Underscore traversal into catalogItem.category.
     */
    List<ProviderService> findByCatalogItem_Category(ServiceCategory category);
}
