package com.servicelink.core.model.business;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table (name = "subscriptions")
@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class Subscription {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false, unique = true)
    private Workspace workspace;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlanType planType;

    @Column(nullable = false)
    private Long amountNpr;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SubscriptionStatus subscriptionStatus = SubscriptionStatus.TRIAL;


    private LocalDateTime trialEndsAt;
    private LocalDateTime currentPeriodStart;
    private LocalDateTime currentPeriodEnd;

    @Column(length = 100)
    private String referenceId;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate(){
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate(){
        updatedAt = LocalDateTime.now();
    }

}
