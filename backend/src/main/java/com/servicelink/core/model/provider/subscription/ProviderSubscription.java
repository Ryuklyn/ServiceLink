package com.servicelink.core.model.provider.subscription;

import com.servicelink.core.model.provider.Provider;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "provider_subscriptions")
@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // provider_subscriptions.provider_id -> providers.id, unique = one row per provider
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false, unique = true)
    private Provider provider;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan_type", nullable = false)
    private SubscriptionPlanType planType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus status;

    @Column(name = "start_date", nullable = false)
    private Instant startDate;

    @Column(name = "end_date", nullable = false)
    private Instant endDate;

    // Set true the moment the trial is issued and never reset — this is what
    // makes the trial a genuine one-time grant per provider, independent of
    // whatever plan they move to afterward.
    @Column(name = "trial_used", nullable = false)
    @Builder.Default
    private Boolean trialUsed = false;

    // Running audit total of bonus days credited via referrals, kept separate
    // from the endDate math itself.
    @Column(name = "referral_bonus_days_total", nullable = false)
    @Builder.Default
    private Integer referralBonusDaysTotal = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Never store "days remaining" as a persisted number — always derive it
    // live from endDate so it's correct at the instant it's read.
    @Transient
    public long getDaysRemaining() {
        if (endDate == null) return 0;
        long seconds = ChronoUnit.SECONDS.between(Instant.now(), endDate);
        if (seconds <= 0) return 0;
        return (long) Math.ceil(seconds / 86400.0); // round up, so "23h left" reads as 1 day not 0
    }

    @Transient
    public boolean isCurrentlyActive() {
        return status == SubscriptionStatus.ACTIVE && endDate != null && endDate.isAfter(Instant.now());
    }

    /** Stacks on top of remaining time if still active; revives if lapsed. */
    public void extend(int days) {
        Instant base = (endDate != null && endDate.isAfter(Instant.now())) ? endDate : Instant.now();
        this.endDate = base.plus(days, ChronoUnit.DAYS);
        if (this.status == SubscriptionStatus.EXPIRED) {
            this.status = SubscriptionStatus.ACTIVE;
        }
    }
}
