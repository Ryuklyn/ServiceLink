package com.servicelink.core.model.provider.subscription;

public enum SubscriptionPlanType {
    FREE_TRIAL(30),
    MONTHLY(30),
    QUARTERLY(90),
    YEARLY(365);

    private final int durationDays;

    SubscriptionPlanType(int durationDays) {
        this.durationDays = durationDays;
    }

    public int getDurationDays() {
        return durationDays;
    }
}
