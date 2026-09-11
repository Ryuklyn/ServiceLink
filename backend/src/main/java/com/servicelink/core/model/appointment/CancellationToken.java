package com.servicelink.core.model.appointment;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "cancellation_tokens",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_cancellation_token_customer_year",
                columnNames = {"customer_id", "year"}
        )
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CancellationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "year", nullable = false)
    private int year;

    @Column(name = "tokens_total", nullable = false)
    @Builder.Default
    private int tokensTotal = 2;

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
