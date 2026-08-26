package com.servicelink.core.dto.response.business.job;

public record ProEligibleProviderResponse(
    Long providerId,
    String fullName,
    String businessName,
    String primaryCategoryName,
    Double averageRating,
    String profilePictureUrl,
    boolean available,
    String location
) {}
