package com.servicelink.core.model.appointment;

// com/servicelink/core/model/appointment/RescheduleToken.java

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Tracks how many free-late-reschedule tokens a customer has used in a given
 * calendar year. One row per (customerId, year) — a new row is lazily created
 * (via RescheduleTokenService.getOrCreateForYear) the first time a customer's
 * balance is touched in a new year, which is what gives the "yearly reset"
 * behavior without a scheduled job.
 */
@Entity
@Table(
        name = "reschedule_tokens",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_reschedule_token_customer_year",
                columnNames = {"customer_id", "year"}
        )
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RescheduleToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "year", nullable = false)
    private int year;

    @Column(name = "tokens_total", nullable = false)
    @Builder.Default
    private int tokensTotal = 3;

    @Column(name = "tokens_used", nullable = false)
    @Builder.Default
    private int tokensUsed = 0;

    @Version
    private Long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public int getRemaining() {
        return tokensTotal - tokensUsed;
    }

    public boolean hasTokenAvailable() {
        return getRemaining() > 0;
    }
}