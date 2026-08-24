package com.servicelink.core.dto.response.business.pool;

import com.servicelink.core.model.business.providerpool.ProviderPoolStatus;
import lombok.Builder;
import lombok.Value;

/**
 * Card shown in a business organization's Provider Pool. Field set matches
 * exactly what ProviderPoolService#toCard() builds — see that method for
 * the mapping logic (including the §7 rule: attendanceRate/onTimeRate are
 * null rather than 0 when the provider has no Pro job history yet).
 */
@Value
@Builder
public class ProviderPoolCardDTO {
    Long poolEntryId;
    Long providerId;
    String fullName;
    String businessName;
    String primaryCategoryName;
    String profilePictureUrl;
    Double averageRating;
    Integer proJobsCompleted;
    Double attendanceRate;
    Double onTimeRate;
    boolean isVerified;
    boolean proOrdersEligible;
    ProviderPoolStatus poolStatus;
}