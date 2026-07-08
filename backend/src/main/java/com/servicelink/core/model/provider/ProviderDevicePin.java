package com.servicelink.core.model.provider;

import com.servicelink.core.model.provider.Provider;
import jakarta.persistence.*;
import lombok.*;

import java.time.Duration;
import java.time.Instant;

@Entity
@Table(name = "provider_device_pins",
        uniqueConstraints = @UniqueConstraint(columnNames = {"provider_id", "device_id"}))
@Getter @Setter @EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderDevicePin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private Provider provider;

    @Column(name = "device_id", nullable = false)
    private String deviceId;

    @Column(name = "pin_hash", nullable = false)
    private String pinHash;

    @Column(name = "device_label")
    private String deviceLabel;

    @Column(name = "last_used_at")
    private Instant lastUsedAt;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    private static final long PIN_TTL_DAYS= 30;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.lastUsedAt = Instant.now();
        if (this.expiresAt == null) {
            this.expiresAt = this.createdAt.plus(Duration.ofDays(PIN_TTL_DAYS));
        }
    }


    public boolean isExpired() {
        return expiresAt != null && Instant.now().isAfter(expiresAt);
    }
}
