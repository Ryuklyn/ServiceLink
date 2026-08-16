package com.servicelink.core.repository.provider;

import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.provider.service.Category;
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

    Page<Provider> findByPrimaryCategory_IdAndIsVerifiedTrueAndIsActiveTrueAndHasCompletedOnboardingTrueOrderByAverageRatingDesc(
            Long primaryCategoryId, Pageable pageable);

    Page<Provider> findByIsVerifiedTrueAndIsActiveTrueAndHasCompletedOnboardingTrueOrderByAverageRatingDesc(
            Pageable pageable);

    Optional<Provider> findByPhone(String phone);
    Optional<Provider> findByReferralCode(String referralCode);
    Optional<Provider> findByUser_Email(String email);

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

    Optional<Provider> findByUser_Id(Long userId);

    @Query("""
            SELECT p FROM Provider p
            WHERE p.primaryCategory.id = :categoryId
              AND p.baseDistrict = :district
              AND p.isActive = true
              AND p.isVerified = true
            ORDER BY p.averageRating DESC, p.totalJobs DESC
            """)
    List<Provider> findByCategoryAndDistrict(
            @Param("categoryId") Long categoryId,
            @Param("district") String district);

    @Query("""
            SELECT p FROM Provider p
            WHERE p.primaryCategory.id = :categoryId
              AND p.isActive = true
              AND p.isVerified = true
            ORDER BY p.averageRating DESC, p.totalJobs DESC
            """)
    List<Provider> findByCategory(@Param("categoryId") Long categoryId);

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

    List<Provider> findByBaseDistrictAndIsActiveTrueAndIsOnlineTrue(String baseDistrict);

    List<Provider> findByPrimaryCategory_IdAndIsVerifiedTrueAndIsActiveTrue(Long primaryCategoryId);

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

    Page<Provider> findByIsVerifiedTrueAndIsActiveTrueOrderByAverageRatingDesc(
            Pageable pageable);

    Page<Provider> findByPrimaryCategory_IdAndIsVerifiedTrueAndIsActiveTrueOrderByAverageRatingDesc(
            Long primaryCategoryId, Pageable pageable);

    List<Provider> findByReferredById(Long referrerId);
}