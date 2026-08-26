package com.servicelink.core.dto.response.business.job;

import java.util.List;

public record ProSlaDashboardResponse(
    double overallCompliance,
    String avgResponseTime,
    long overdueJobs,
    double cancelRate,
    List<MonthlyTrend> trend,
    List<CategoryPerf> categories,
    List<ProviderSlaPerf> providers
) {
    public record MonthlyTrend(String month, double value) {}
    public record CategoryPerf(String label, double value, String color) {}
    public record ProviderSlaPerf(
        String provider,
        String category,
        long totalJobs,
        double onTime,
        long breaches,
        String status
    ) {}
}
