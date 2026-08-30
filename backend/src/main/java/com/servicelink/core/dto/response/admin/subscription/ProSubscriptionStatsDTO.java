package com.servicelink.core.dto.response.admin.subscription;

import lombok.Builder;
import lombok.Value;
import java.math.BigDecimal;

@Value
@Builder
public class ProSubscriptionStatsDTO {
    long activeCount;
    long trialCount;
    long expiringSoonCount;
    BigDecimal monthlyRevenue;
}
