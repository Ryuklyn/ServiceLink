package com.servicelink.core.dto.response.business.job;

import java.util.List;

public record ProComplianceDashboardResponse(
    long approvedCount,
    long pendingCount,
    long rejectedCount,
    List<ProviderVerificationRow> providers,
    List<AuditLogRow> auditLogs
) {
    public record ProviderVerificationRow(
        String name,
        String category,
        String status,
        String joinedDate
    ) {}

    public record AuditLogRow(
        String timestamp,
        String action,
        String subject,
        String performedBy,
        String status
    ) {}
}
