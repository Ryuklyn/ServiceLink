package com.servicelink.core.dto.response.admin.subscription;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;

/**
 * TODO: no backing entity exists for this yet. The frontend's "System Events"
 * tab (SUBSCRIPTION_EXTENDED, REFERRAL_BONUS_AWARDED, PAYMENT_SUCCESS,
 * PAYMENT_FAILED, KYC_VERIFIED, SUBSCRIPTION_REVOKED, TRIAL_ISSUED) needs a
 * real audit log — either a dedicated subscription_events table written to
 * from ProviderSubscriptionService/PaymentService at each of those moments,
 * or some other event-sourcing mechanism already in the codebase that I
 * don't have visibility into. Until that exists, AdminSubscriptionService
 * returns an empty list for this and the tab will just show "No events
 * recorded yet."
 */
@Value
@Builder
public class SystemEventDTO {
    String id;
    String type;
    String description;
    Instant createdAt;
    String source; // "SYSTEM" | "ADMIN"
}