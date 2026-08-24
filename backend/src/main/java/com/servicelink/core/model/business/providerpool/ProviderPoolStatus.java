package com.servicelink.core.model.business.providerpool;
/**
 * Status of a provider's membership in an organization's Pro Provider Pool
 * (prodashboard.md §7 — distinct from the provider's global ServiceLink
 * verification/rating, and distinct from Pro-orders eligibility).
 */
public enum ProviderPoolStatus {
    ACTIVE,
    PENDING_APPROVAL,
    DECLINED
}