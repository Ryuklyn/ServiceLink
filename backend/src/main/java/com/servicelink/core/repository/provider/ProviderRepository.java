package com.servicelink.core.repository.provider;

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

    Page<Provider> findByPrimaryServiceAndIsVerifiedTrueAndIsActiveTrueAndHasCompletedOnboardingTrueOrderByAverageRatingDesc(
            ServiceCategory category, Pageable pageable);

    Page<Provider> findByIsVerifiedTrueAndIsActiveTrueAndHasCompletedOnboardingTrueOrderByAverageRatingDesc(
            Pageable pageable);

    Optional<Provider> findByPhone(String phone);
    Optional<Provider> findByReferralCode(String referralCode);

    Optional<Provider> findByUser_Email(String email);

    // ── Profile fetches ───────────────────────────────────────────────────────

    @Query("""
            SELECT DISTINCT p FROM Provider p
            LEFT JOIN FETCH p.services ps
            LEFT JOIN FETCH ps.catalogItem
            LEFT JOIN FETCH p.portfolio
            WHERE p.id = :id AND p.isActive = true
            """)
    Optional<Provider> findByIdWithFullDetails(@Param("id") Long id);

    @Query("""
            SELECT p FROM Provider p
            LEFT JOIN FETCH p.services s
            LEFT JOIN FETCH s.catalogItem
            WHERE p.id = :id
            """)
    Optional<Provider> findProfileWithServicesById(@Param("id") Long id);

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

    @Query("""
            SELECT p FROM Provider p
            WHERE p.primaryService = :category
              AND p.isActive = true
              AND p.isVerified = true
            ORDER BY p.averageRating DESC, p.totalJobs DESC
            """)
    List<Provider> findByCategory(@Param("category") ServiceCategory category);

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

    List<Provider> findByBaseDistrictAndIsActiveTrueAndIsOnlineTrue(String baseDistrict);

    List<Provider> findByPrimaryServiceAndIsVerifiedTrueAndIsActiveTrue(
            ServiceCategory primaryService);

    // ── Geospatial ────────────────────────────────────────────────────────────

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

    Page<Provider> findByIsVerifiedTrueAndIsActiveTrueOrderByAverageRatingDesc(
            Pageable pageable);

    Page<Provider> findByPrimaryServiceAndIsVerifiedTrueAndIsActiveTrueOrderByAverageRatingDesc(
            ServiceCategory primaryService, Pageable pageable);

    List<Provider> findByReferredById(Long referrerId);
}