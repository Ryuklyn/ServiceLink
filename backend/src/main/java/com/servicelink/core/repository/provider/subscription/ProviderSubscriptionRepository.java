package com.servicelink.core.repository.provider.subscription;

import com.servicelink.core.model.provider.subscription.ProviderSubscription;
import com.servicelink.core.model.provider.subscription.SubscriptionPlanType;
import com.servicelink.core.model.provider.subscription.SubscriptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface ProviderSubscriptionRepository extends JpaRepository<ProviderSubscription, Long> {

    Optional<ProviderSubscription> findByProvider_Id(Long providerId);

    boolean existsByProvider_Id(Long providerId);

    // Feeds the daily expiry sweep.
    List<ProviderSubscription> findByStatusAndEndDateBefore(SubscriptionStatus status, Instant cutoff);

    // =====================================================================
    // ADMIN — backs AdminSubscriptionController / ProviderSubscriptionService#adminSearch,adminGetStats
    // =====================================================================

    /**
     * Backs the admin "Provider Subscriptions" table search/filter. All
     * three filter params are optional — pass null to skip that condition.
     * :search matches against Provider.fullName / Provider.email (the
     * KYC-synced columns Provider owns directly) rather than the linked
     * User's login credentials, since those are what the admin table
     * actually displays (see ProviderSubscriptionService#toAdminRowDto) —
     * they can legitimately diverge from the User row. Caller is expected
     * to lowercase :search before passing in.
     */
    @Query("""
            SELECT s FROM ProviderSubscription s
            JOIN s.provider p
            WHERE (:status IS NULL OR s.status = :status)
              AND (:planType IS NULL OR s.planType = :planType)
              AND (:search IS NULL
                   OR LOWER(p.fullName) LIKE CONCAT('%', :search, '%')
                   OR LOWER(p.email) LIKE CONCAT('%', :search, '%'))
            """)
    Page<ProviderSubscription> search(
            @Param("status") SubscriptionStatus status,
            @Param("planType") SubscriptionPlanType planType,
            @Param("search") String search,
            Pageable pageable
    );

    // "Active Paid Subscriptions" KPI — active, excluding free trials.
    long countByStatusAndPlanTypeNot(SubscriptionStatus status, SubscriptionPlanType excludedPlan);

    // "Expiring Soon" KPI — active subscriptions ending within the window.
    long countByStatusAndEndDateBetween(SubscriptionStatus status, Instant from, Instant to);

    // "Trial Conversions" KPI denominator/numerator.
    long countByTrialUsedTrue();

    long countByTrialUsedTrueAndPlanTypeNot(SubscriptionPlanType excludedPlan);
}