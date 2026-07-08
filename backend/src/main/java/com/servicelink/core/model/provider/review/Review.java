package com.servicelink.core.model.provider.review;

import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "reviews")
@Getter  @Setter @EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private Provider provider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Column(name = "appointment_id")
    private Long appointmentId; // Optional: link to actual appointment

    @Column(nullable = false)
    private Integer rating; // 1–5 stars

    @Column(columnDefinition = "TEXT")
    private String comment;

    // Dimensional scores (optional, for detailed analytics)
    private Integer punctualityScore; // 0–100
    private Integer qualityScore;     // 0–100
    private Integer communicationScore; // 0–100
    private Integer valueScore;       // 0–100

    @Column(name = "service_name")
    private String serviceName; // e.g., "Ceiling Fan Installation"

    @Column(name = "is_verified_booking")
    private Boolean isVerifiedBooking = false; // Only review after completed job

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }
}