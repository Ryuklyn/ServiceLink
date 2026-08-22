package com.servicelink.core.dto.response.admin.subscription;

import lombok.Builder;
import lombok.Value;

/**
 * Backs the four KPI cards on the admin Subscription Management page.
 * <p>
 * revenueGrowthPct / activePaidGrowthPct / trialConversionGrowthPct are
 * month-over-month deltas. Computing "last month" comparisons needs either a
 * snapshot table or a derived query against PaymentTransaction.createdAt —
 * left as 0 here (see AdminSubscriptionQueryService) until that's decided;
 * wire in real month-over-month math once you pick an approach.
 */
@Value
@Builder
public class SubscriptionStatsDTO {
    long totalRevenue;
    double revenueGrowthPct;
    long activePaidSubscriptions;
    double activePaidGrowthPct;
    double trialConversionPct;
    double trialConversionGrowthPct;
    long expiringSoonCount;
    int expiringSoonWindowDays;
}