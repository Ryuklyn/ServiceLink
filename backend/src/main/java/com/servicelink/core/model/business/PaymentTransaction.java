package com.servicelink.core.model.business;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id",nullable = false)
    private Subscription subscription;

    /** Internal reference shown to user: SLP-2026-019502 */
    @Column(nullable = false, unique = true, length = 100)
    private String referenceId;

    /** Gateway-assigned transaction ID returned in callback */
    @Column(length = 200)
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

    /** Raw response from gateway stored as JSON string for audit */
    @Column(columnDefinition = "TEXT")
    private String gatewayResponse;

    /** The URL we redirected the user to */
    @Column(length = 500)
    private String gatewayRedirectUrl;

    @Column(updatable = false)
    private LocalDateTime initiatedAt;
    private LocalDateTime completedAt;

    @PrePersist
    protected void create(){

    }

}
