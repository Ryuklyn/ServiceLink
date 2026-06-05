package com.servicelink.core.repository.appointment;

import com.servicelink.core.model.common.ServiceCategory;
import com.servicelink.core.model.provider.Provider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProviderRepository extends JpaRepository<Provider, Long>,
        JpaSpecificationExecutor<Provider> {

    // ── Profile fetches ───────────────────────────────────────────────────────

    /**
     * Full profile: services + catalogItem + portfolio in one DISTINCT query.
     * Use this for the provider profile page — prevents N+1 completely.
     * Guards on isActive so inactive providers return empty.
     */
    @Query("""
            SELECT DISTINCT p FROM Provider p
            LEFT JOIN FETCH p.services ps
            LEFT JOIN FETCH ps.catalogItem
            LEFT JOIN FETCH p.portfolio
            WHERE p.id = :id AND p.isActive = true
            """)
    Optional<Provider> findByIdWithFullDetails(@Param("id") Long id);

    /**
     * Services only — lighter fetch when portfolio is not needed.
     * Example use: booking flow where you only need sub-service list.
     */
    @Query("""
            SELECT p FROM Provider p
            LEFT JOIN FETCH p.services s
            LEFT JOIN FETCH s.catalogItem
            WHERE p.id = :id
            """)
    Optional<Provider> findProfileWithServicesById(@Param("id") Long id);

    /**
     * Portfolio only — for a portfolio-tab load without refetching services.
     */
    @Query("""
            SELECT p FROM Provider p
            LEFT JOIN FETCH p.portfolio
            WHERE p.id = :id
            """)
    Optional<Provider> findProfileWithPortfolioById(@Param("id") Long id);

    // ── User account resolution ───────────────────────────────────────────────

    /**
     * Resolve provider from JWT userId.
     * Field is `user` (@OneToOne), so Spring Data requires underscore: findByUser_Id.
     * findByUserId will fail at startup — do not use that form.
     */
    Optional<Provider> findByUser_Id(Long userId);

    // ── Search: district + category ───────────────────────────────────────────

    /**
     * Primary search: category + district, sorted by rating then experience.
     * Used as the main result when user selects a service category in their area.
     */
    @Query("""
            SELECT p FROM Provider p
            WHERE p.primaryService = :category
              AND p.baseDistrict = :district
              AND p.isActive = true
              AND p.isVerified = true
            ORDER BY p.averageRating DESC, p.totalJobs DESC
            """)
    List<Provider> findByCategoryAndDistrict(
            @Param("category") ServiceCategory category,
            @Param("district") String district);

    /**
     * Category-wide fallback — used when district search returns fewer than 3 results.
     */
    @Query("""
            SELECT p FROM Provider p
            WHERE p.primaryService = :category
              AND p.isActive = true
              AND p.isVerified = true
            ORDER BY p.averageRating DESC, p.totalJobs DESC
            """)
    List<Provider> findByCategory(@Param("category") ServiceCategory category);

    /**
     * Sub-service drill-down: providers who offer a specific catalog item.
     * Used when user taps a sub-service card (e.g. "Ceiling Fan Installation").
     */
    @Query("""
            SELECT DISTINCT p FROM Provider p
            JOIN p.services ps
            WHERE ps.catalogItem.id = :catalogId
              AND ps.isAvailable = true
              AND p.isActive = true
              AND p.isVerified = true
            ORDER BY p.averageRating DESC
            """)
    List<Provider> findByCatalogSubService(@Param("catalogId") Long catalogId);

    // ── Online / availability ─────────────────────────────────────────────────

    /**
     * Active AND online providers in a district — "available now" feature.
     * Providers toggle isOnline manually or via the provider app.
     */
    List<Provider> findByBaseDistrictAndIsActiveTrueAndIsOnlineTrue(String baseDistrict);

    /**
     * All verified+active providers for a category — no district scope.
     * Useful for admin overviews and fallback searches.
     */
    List<Provider> findByPrimaryServiceAndIsVerifiedTrueAndIsActiveTrue(
            ServiceCategory primaryService);

    // ── Geospatial ────────────────────────────────────────────────────────────

    /**
     * Bounding box search using lat/lng columns.
     * Returns providers roughly within a coordinate square.
     * Combine with Haversine formula in the service layer for precise km radius.
     *
     * Bounding box calculation (service layer):
     *   double delta = radiusKm / 111.0;  // 1 degree ≈ 111 km
     *   minLat = centerLat - delta;
     *   maxLat = centerLat + delta;
     *   minLng = centerLng - delta / cos(toRadians(centerLat));
     *   maxLng = centerLng + delta / cos(toRadians(centerLat));
     */
    @Query("""
            SELECT p FROM Provider p
            WHERE p.isActive = true
              AND p.latitude  BETWEEN :minLat AND :maxLat
              AND p.longitude BETWEEN :minLng AND :maxLng
            """)
    List<Provider> findProvidersInBoundingBox(
            @Param("minLat") Double minLat,
            @Param("maxLat") Double maxLat,
            @Param("minLng") Double minLng,
            @Param("maxLng") Double maxLng);

    // ── Paginated / featured ──────────────────────────────────────────────────

    /**
     * Top-rated verified providers system-wide — paginated.
     * Used for "Featured Providers" or "Top Rated" sections on the home screen.
     */
    Page<Provider> findByIsVerifiedTrueAndIsActiveTrueOrderByAverageRatingDesc(
            Pageable pageable);
}