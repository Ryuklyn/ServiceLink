package com.servicelink.core.dto.response.admin;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AdminDashboardStatsDTO {
    long totalRevenue;
    long activeProSubscriptions;
    long verifiedProviders;
    long pendingKycCount;
}
