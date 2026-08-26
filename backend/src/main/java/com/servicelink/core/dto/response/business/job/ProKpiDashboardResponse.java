package com.servicelink.core.dto.response.business.job;

import java.math.BigDecimal;

public record ProKpiDashboardResponse(
    long activeProviders,
    long pendingApprovals,
    long jobsThisMonth,
    long jobsInProgress,
    double slaComplianceRate,
    BigDecimal monthlySpend,
    long expectedToday,
    long presentToday,
    long lateToday,
    long missingToday
) {}
