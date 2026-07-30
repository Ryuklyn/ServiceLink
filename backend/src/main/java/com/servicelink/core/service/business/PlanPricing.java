package com.servicelink.core.service.business;

import com.servicelink.core.model.business.PlanType;
import java.util.Map;

public final class PlanPricing {
    private PlanPricing() {}

    // Must match PlanStep.tsx PLANS[].amountNpr exactly. Enterprise is
    // deliberately excluded — custom pricing, never self-serve payable.
    public static final Map<PlanType, Long> PRICE_NPR = Map.of(
            PlanType.STARTER, 1999L,
            PlanType.GROWTH, 4999L
    );

    // Resolves which plan the client's requested amount corresponds to.
    // Throws if it doesn't match any known price (blocks tampered amounts
    // and blocks Enterprise, since it's not in the map).
    public static PlanType resolvePlanForAmount(long amountNpr) {
        return PRICE_NPR.entrySet().stream()
                .filter(e -> e.getValue().equals(amountNpr))
                .map(Map.Entry::getKey)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Amount " + amountNpr + " does not match any self-serve plan price"));
    }
}