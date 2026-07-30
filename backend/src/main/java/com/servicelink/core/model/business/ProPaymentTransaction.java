package com.servicelink.core.model.business;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pro_payment_transactions")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ProPaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", nullable = false)
    private Subscription subscription;

    @Column(nullable = false, unique = true, length = 100)
    private String referenceId;

    private String gatewayTransactionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentGateway paymentGateway;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.INITIATED;

    @Column(nullable = false)
    private Long amountNpr;

    @Enumerated(EnumType.STRING)
    private PlanType targetPlanType;

    private LocalDateTime initiatedAt;
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() { initiatedAt = LocalDateTime.now(); }
}