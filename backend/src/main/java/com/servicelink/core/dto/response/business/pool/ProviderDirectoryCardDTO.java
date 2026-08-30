package com.servicelink.core.dto.response.business.pool;

import lombok.Builder;
import lombok.Data;

/**
 * Card-level shape for GET /api/pro/provider-directory.
 *
 * Only providers that pass ProviderPoolService#computeProOrdersEligible are
 * ever included here (prodashboard.md §6 — Directory answers "which
 * providers are potentially eligible for Pro work", so eligibility is the
 * entry filter, not just a badge). Providers already in this organization's
 * pool are excluded — once added, they're only managed from the Provider
 * Pool page.
 */
@Data
@Builder
public class ProviderDirectoryCardDTO {

    private Long providerId;

    private String fullName;
    private String businessName;
    private String primaryCategoryName;
    private String specializesIn;
    private String profilePictureUrl;

    private Double averageRating;
    private String responseTimeLabel; // bucketed from avgResponseMinutes, e.g. "Under 1 hour"
    private String location;          // baseDistrict / serviceAreaText
    private Integer totalJobs;

    private Boolean isVerified; // KYB

    private Boolean alreadyInPool;
}