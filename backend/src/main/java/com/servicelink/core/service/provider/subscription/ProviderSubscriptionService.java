package com.servicelink.core.service.provider.subscription;

import com.servicelink.core.dto.request.admin.subscription.ExtendSubscriptionRequest;
import com.servicelink.core.dto.request.admin.subscription.RevokeSubscriptionRequest;
import com.servicelink.core.dto.response.admin.subscription.AdminSubscriptionRowDTO;
import com.servicelink.core.dto.response.admin.subscription.PagedResponseDTO;
import com.servicelink.core.dto.response.admin.subscription.SubscriptionHistoryDTO;
import com.servicelink.core.dto.response.admin.subscription.SubscriptionStatsDTO;
import com.servicelink.core.dto.response.provider.subscription.SubscriptionStatusDTO;
import com.servicelink.core.exception.BusinessException;
import com.servicelink.core.model.notification.NotificationCategory;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.provider.subscription.ProviderSubscription;
import com.servicelink.core.model.provider.subscription.SubscriptionPlanType;
import com.servicelink.core.model.provider.subscription.SubscriptionStatus;
import com.servicelink.core.model.user.Role;
import com.servicelink.core.repository.provider.ProviderRepository;
import com.servicelink.core.repository.provider.availability.ProviderScheduleSettingsRepository;
import com.servicelink.core.repository.provider.subscription.ProviderSubscriptionRepository;
import com.servicelink.core.service.EmailService;
import com.servicelink.core.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProviderSubscriptionService {

    private final ProviderSubscriptionRepository subscriptionRepo;
    private final ProviderRepository providerRepo;
    private final NotificationService notificationService;
    private final ProviderScheduleSettingsRepository scheduleSettingsRepo;
    private final EmailService emailService;


    @Transactional
    public ProviderSubscription issueTrialIfEligible(Provider provider) {
        return subscriptionRepo.findByProvider_Id(provider.getId())
                .orElseGet(() -> {
                    Instant now = Instant.now();
                    ProviderSubscription sub = ProviderSubscription.builder()
                            .provider(provider)
                            .planType(SubscriptionPlanType.FREE_TRIAL)
                            .status(SubscriptionStatus.ACTIVE)
                            .startDate(now)
                            .endDate(now.plus(SubscriptionPlanType.FREE_TRIAL.getDurationDays(), ChronoUnit.DAYS))
                            .trialUsed(true)
                            .referralBonusDaysTotal(0)
                            .build();

                    syncProviderIsActive(provider, true);

                    log.info("Issued {}-day free trial to provider {}",
                            SubscriptionPlanType.FREE_TRIAL.getDurationDays(), provider.getId());
                    return subscriptionRepo.save(sub);
                });
    }

    @Transactional(readOnly = true)
    public SubscriptionStatusDTO getStatus(Long providerId) {
        ProviderSubscription sub = subscriptionRepo.findByProvider_Id(providerId)
                .orElseThrow(() -> new BusinessException(
                        "No subscription found for provider", "SUBSCRIPTION_NOT_FOUND"));
        return toDto(sub);
    }

    @Transactional
    public SubscriptionStatusDTO addReferralBonus(Long providerId, int bonusMonths) {
        ProviderSubscription sub = subscriptionRepo.findByProvider_Id(providerId)
                .orElseThrow(() -> new BusinessException(
                        "No subscription found for provider", "SUBSCRIPTION_NOT_FOUND"));

        int bonusDays = bonusMonths * 30;
        sub.extend(bonusDays);
        sub.setReferralBonusDaysTotal(sub.getReferralBonusDaysTotal() + bonusDays);
        subscriptionRepo.save(sub);

        syncProviderIsActive(sub.getProvider(), sub.getStatus() == SubscriptionStatus.ACTIVE);

        log.info("Credited {} referral bonus day(s) to provider {} (new end date {})",
                bonusDays, providerId, sub.getEndDate());
        return toDto(sub);
    }

    @Transactional
    public SubscriptionStatusDTO upgradePlan(Long providerId, SubscriptionPlanType newPlan) {
        ProviderSubscription sub = subscriptionRepo.findByProvider_Id(providerId)
                .orElseThrow(() -> new BusinessException(
                        "No subscription found for provider", "SUBSCRIPTION_NOT_FOUND"));

        Instant now = Instant.now();
        boolean hasRemainingTime = sub.getEndDate() != null && sub.getEndDate().isAfter(now);
        Instant carryOverBase = hasRemainingTime ? sub.getEndDate() : now;
        long carriedOverDays = hasRemainingTime ? ChronoUnit.DAYS.between(now, sub.getEndDate()) : 0;

        sub.setPlanType(newPlan);
        sub.setStatus(SubscriptionStatus.ACTIVE);
        if (!hasRemainingTime) {
            sub.setStartDate(now);
        }
        sub.setEndDate(carryOverBase.plus(newPlan.getDurationDays(), ChronoUnit.DAYS));
        subscriptionRepo.save(sub);

        syncProviderIsActive(sub.getProvider(), true);

        log.info("Provider {} upgraded to {} — {} carried-over day(s) + {} new day(s), new end date {}",
                providerId, newPlan, carriedOverDays, newPlan.getDurationDays(), sub.getEndDate());

        notificationService.sendPrivateNotification(
                sub.getProvider().getUser().getId(),
                Role.PROVIDER,
                NotificationCategory.BOOKING,
                "Subscription Activated",
                "Your " + newPlan.name() + " plan is now active. New expiry: " + sub.getEndDate(),
                "/provider/subscription"
        );

        return toDto(sub);
    }

    @Scheduled(cron = "0 5 0 * * *")
    @Transactional
    public void expireOverdueSubscriptions() {
        List<ProviderSubscription> overdue =
                subscriptionRepo.findByStatusAndEndDateBefore(SubscriptionStatus.ACTIVE, Instant.now());

        overdue.forEach(sub -> {
            sub.setStatus(SubscriptionStatus.EXPIRED);
            syncProviderIsActive(sub.getProvider(), false);

            scheduleSettingsRepo.findById(sub.getProvider().getId())
                    .filter(s -> Boolean.TRUE.equals(s.getAcceptsProOrders()))
                    .ifPresent(s -> {
                        s.setAcceptsProOrders(false);
                        scheduleSettingsRepo.save(s);
                        log.info("Provider {} acceptsProOrders reset to false (subscription expired)",
                                sub.getProvider().getId());
                    });

            emailService.sendSubscriptionExpiredEmail(
                    sub.getProvider().getUser().getEmail(),
                    sub.getProvider().getUser().getFullName(),
                    sub.getPlanType().name(),
                    sub.getEndDate()
            );
        });

        subscriptionRepo.saveAll(overdue);
        if (!overdue.isEmpty()) {
            log.info("Expired {} provider subscription(s) and deactivated their providers", overdue.size());
        }
    }

    // =====================================================================
    // ADMIN — everything below backs /api/admin/subscriptions/*
    // =====================================================================

    /**
     * Paged/filtered list for the admin "Provider Subscriptions" table.
     * <p>
     * REQUIRES a repository method that doesn't exist yet — see the
     * {@code search(...)} call below. Add it to ProviderSubscriptionRepository;
     * I don't have that interface's current contents, so I can't append to it
     * directly. JPQL sketch:
     * <pre>
     * {@literal @}Query("""
     *     SELECT s FROM ProviderSubscription s
     *     JOIN s.provider p
     *     JOIN p.user u
     *     WHERE (:status IS NULL OR s.status = :status)
     *       AND (:planType IS NULL OR s.planType = :planType)
     *       AND (:search IS NULL OR LOWER(u.fullName) LIKE %:search%
     *            OR LOWER(u.email) LIKE %:search%)
     *     """)
     * Page&lt;ProviderSubscription&gt; search(
     *     {@literal @}Param("status") SubscriptionStatus status,
     *     {@literal @}Param("planType") SubscriptionPlanType planType,
     *     {@literal @}Param("search") String search,
     *     Pageable pageable
     * );
     * </pre>
     */
    @Transactional(readOnly = true)
    public PagedResponseDTO<AdminSubscriptionRowDTO> adminSearch(
            SubscriptionStatus status,
            SubscriptionPlanType planType,
            String search,
            int page,
            int size
    ) {
        String normalizedSearch = (search == null || search.isBlank())
                ? null
                : search.trim().toLowerCase();

        Page<ProviderSubscription> results = subscriptionRepo.search(
                status, planType, normalizedSearch, PageRequest.of(page, size)
        );

        Page<AdminSubscriptionRowDTO> mapped = results.map(this::toAdminRowDto);
        return PagedResponseDTO.from(mapped);
    }

    /**
     * KPI stats for the admin dashboard cards.
     * <p>
     * REQUIRES repository count methods that don't exist yet. Add to
     * ProviderSubscriptionRepository:
     * <pre>
     * long countByStatusAndPlanTypeNot(SubscriptionStatus status, SubscriptionPlanType excludedPlan);
     * long countByStatusAndEndDateBetween(SubscriptionStatus status, Instant from, Instant to);
     * long countByTrialUsedTrue();
     * long countByTrialUsedTrueAndPlanTypeNot(SubscriptionPlanType excludedPlan);
     * </pre>
     * totalRevenue needs a sum over successful PaymentTransaction rows — that
     * repository/service isn't in what I have, so it's stubbed at 0 below.
     * Month-over-month growth percentages need a "last month" comparison
     * point (snapshot table, or a query against createdAt ranges) — also
     * stubbed at 0.0 until you decide how that should be computed.
     */
    @Transactional(readOnly = true)
    public SubscriptionStatsDTO adminGetStats() {
        int expiringSoonWindowDays = 7;
        Instant now = Instant.now();
        Instant expiringSoonCutoff = now.plus(expiringSoonWindowDays, ChronoUnit.DAYS);

        long activePaid = subscriptionRepo.countByStatusAndPlanTypeNot(
                SubscriptionStatus.ACTIVE, SubscriptionPlanType.FREE_TRIAL);

        long expiringSoon = subscriptionRepo.countByStatusAndEndDateBetween(
                SubscriptionStatus.ACTIVE, now, expiringSoonCutoff);

        long everTrialed = subscriptionRepo.countByTrialUsedTrue();
        long trialedAndPaid = subscriptionRepo.countByTrialUsedTrueAndPlanTypeNot(
                SubscriptionPlanType.FREE_TRIAL);
        double trialConversionPct = everTrialed == 0
                ? 0.0
                : (trialedAndPaid * 100.0) / everTrialed;

        // TODO: wire real revenue sum once PaymentTransaction repository is available here.
        long totalRevenue = 0L;

        return SubscriptionStatsDTO.builder()
                .totalRevenue(totalRevenue)
                .revenueGrowthPct(0.0) // TODO: month-over-month
                .activePaidSubscriptions(activePaid)
                .activePaidGrowthPct(0.0) // TODO: month-over-month
                .trialConversionPct(trialConversionPct)
                .trialConversionGrowthPct(0.0) // TODO: month-over-month
                .expiringSoonCount(expiringSoon)
                .expiringSoonWindowDays(expiringSoonWindowDays)
                .build();
    }

    /**
     * Detail view for the "Subscription History & Logs" modal.
     * <p>
     * Transaction Log tab is real (delegates to whatever already backs
     * {@code paymentService.getTransactionsForProvider(userId)} in
     * ProviderSubscriptionController — plug that call in here once this
     * method has a PaymentService dependency injected). System Events tab
     * has no backing table yet — see SystemEventDTO's javadoc — so it comes
     * back empty for now.
     */
    @Transactional(readOnly = true)
    public SubscriptionHistoryDTO adminGetHistory(Long providerId) {
        ProviderSubscription sub = subscriptionRepo.findByProvider_Id(providerId)
                .orElseThrow(() -> new BusinessException(
                        "No subscription found for provider", "SUBSCRIPTION_NOT_FOUND"));

        return SubscriptionHistoryDTO.builder()
                .subscription(toAdminRowDto(sub))
                // TODO: paymentService.getTransactionsForProvider(sub.getProvider().getUser().getId())
                .transactions(Collections.emptyList())
                .events(Collections.emptyList()) // TODO: see SystemEventDTO
                .build();
    }

    /**
     * Manual admin extension. Reuses the exact same stacking semantics as
     * every other date-mutating path in this service (upgradePlan, extend
     * via addReferralBonus): carries over remaining time if still active,
     * starts fresh from now if lapsed, and revives EXPIRED -> ACTIVE.
     * <p>
     * {@code reason} is captured for audit purposes but has nowhere to be
     * durably written yet — see SystemEventDTO's javadoc. Logged at INFO in
     * the meantime so it's at least in the application logs.
     */
    @Transactional
    public AdminSubscriptionRowDTO adminExtend(Long providerId, ExtendSubscriptionRequest req) {
        ProviderSubscription sub = subscriptionRepo.findByProvider_Id(providerId)
                .orElseThrow(() -> new BusinessException(
                        "No subscription found for provider", "SUBSCRIPTION_NOT_FOUND"));

        sub.extend(req.getDays());
        subscriptionRepo.save(sub);

        syncProviderIsActive(sub.getProvider(), sub.getStatus() == SubscriptionStatus.ACTIVE);

        log.info("ADMIN EXTEND: provider {} +{} day(s), new end date {} — reason: {}",
                providerId, req.getDays(), sub.getEndDate(), req.getReason());

        return toAdminRowDto(sub);
    }

    /**
     * Manual admin revocation. Mirrors the side effects of the daily expiry
     * sweep (status -> CANCELLED rather than EXPIRED, isActive -> false,
     * acceptsProOrders -> false) but is admin-triggered rather than
     * date-driven.
     */
    @Transactional
    public AdminSubscriptionRowDTO adminRevoke(Long providerId, RevokeSubscriptionRequest req) {
        ProviderSubscription sub = subscriptionRepo.findByProvider_Id(providerId)
                .orElseThrow(() -> new BusinessException(
                        "No subscription found for provider", "SUBSCRIPTION_NOT_FOUND"));

        sub.setStatus(SubscriptionStatus.CANCELLED);
        subscriptionRepo.save(sub);

        syncProviderIsActive(sub.getProvider(), false);

        scheduleSettingsRepo.findById(sub.getProvider().getId())
                .filter(s -> Boolean.TRUE.equals(s.getAcceptsProOrders()))
                .ifPresent(s -> {
                    s.setAcceptsProOrders(false);
                    scheduleSettingsRepo.save(s);
                });

        log.info("ADMIN REVOKE: provider {} subscription cancelled — reason: {}",
                providerId, req.getReason());

        return toAdminRowDto(sub);
    }

    // =====================================================================

    private void syncProviderIsActive(Provider provider, boolean shouldBeActive) {
        if (!Boolean.valueOf(shouldBeActive).equals(provider.getIsActive())) {
            provider.setIsActive(shouldBeActive);
            providerRepo.save(provider);
            log.info("Provider {} isActive -> {} (subscription-driven)", provider.getId(), shouldBeActive);
        }
    }

    private SubscriptionStatusDTO toDto(ProviderSubscription sub) {
        return SubscriptionStatusDTO.builder()
                .planType(sub.getPlanType())
                .status(sub.getStatus())
                .startDate(sub.getStartDate())
                .endDate(sub.getEndDate())
                .daysRemaining(sub.getDaysRemaining())
                .isActive(sub.isCurrentlyActive())
                .trialUsed(sub.getTrialUsed())
                .referralBonusDaysTotal(sub.getReferralBonusDaysTotal())
                .build();
    }

    /**
     * Provider has its own fullName/email columns (synced from KYC via
     * syncFromKyc), so these come straight off Provider rather than through
     * provider.getUser(). Category is a ManyToOne to Category
     * (primaryCategory), so it's provider.getPrimaryCategory().getName() —
     * null-guarded since primaryCategory could theoretically be null before
     * KYC sync completes, even though the column is marked nullable = false.
     */
    private AdminSubscriptionRowDTO toAdminRowDto(ProviderSubscription sub) {
        Provider provider = sub.getProvider();
        String category = provider.getPrimaryCategory() != null
                ? provider.getPrimaryCategory().getName()
                : null;

        return AdminSubscriptionRowDTO.builder()
                .providerId(provider.getId())
                .providerName(provider.getFullName())
                .email(provider.getEmail())
                .category(category)
                .profilePictureUrl(provider.getProfilePictureUrl())
                .planType(sub.getPlanType())
                .status(sub.getStatus())
                .startDate(sub.getStartDate())
                .endDate(sub.getEndDate())
                .daysRemaining(sub.getDaysRemaining())
                .referralBonusDaysTotal(sub.getReferralBonusDaysTotal())
                .build();
    }
}