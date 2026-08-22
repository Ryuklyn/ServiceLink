package com.servicelink.core.dto.response.admin.subscription;

import com.servicelink.core.model.provider.subscription.SubscriptionPlanType;
import com.servicelink.core.model.provider.subscription.SubscriptionStatus;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;

/**
 * One row in the admin "Provider Subscriptions" table.
 * <p>
 * NOTE: verifiedReferrals / referralGoal from the original frontend mock are
 * intentionally omitted — there's no backing field for a referral *count* on
 * ProviderSubscription, only {@code referralBonusDaysTotal} (an audit total
 * of days credited). If per-provider referral counts need to show up here,
 * that requires either a new field/table or a derived count from wherever
 * referrals are actually recorded.
 */
@Value
@Builder
public class AdminSubscriptionRowDTO {
    Long providerId;
    String providerName;
    String email;
    String category;
    SubscriptionPlanType planType;
    SubscriptionStatus status;
    Instant startDate;
    Instant endDate;
    long daysRemaining;
    int referralBonusDaysTotal;
}