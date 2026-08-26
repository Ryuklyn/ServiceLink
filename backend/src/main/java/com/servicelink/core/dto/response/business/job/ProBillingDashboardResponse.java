package com.servicelink.core.dto.response.business.job;

import java.math.BigDecimal;
import java.util.List;

public record ProBillingDashboardResponse(
    BigDecimal totalBudget,
    BigDecimal spent,
    BigDecimal pending,
    BigDecimal remaining,
    List<InvoiceInfo> invoices
) {
    public record InvoiceInfo(
        String id,
        String provider,
        String service,
        BigDecimal amount,
        String status,
        String dueDate
    ) {}
}
