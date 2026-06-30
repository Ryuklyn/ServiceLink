// com/servicelink/core/model/appointment/Appointment.java
package com.servicelink.core.model.appointment;

import com.servicelink.core.model.common.TimeSlot;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.provider.ServiceCatalog;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(
        name = "appointments",
        indexes = {
                @Index(name = "idx_appt_customer_id",     columnList = "customer_id"),
                @Index(name = "idx_appt_provider_id",     columnList = "provider_id"),
                @Index(name = "idx_appt_date",            columnList = "appointment_date"),
                @Index(name = "idx_appt_status",          columnList = "status"),
                @Index(name = "idx_appt_provider_date",   columnList = "provider_id, appointment_date"),
                @Index(name = "idx_appt_customer_status", columnList = "customer_id, status")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Relations ─────────────────────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private Provider provider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_catalog_id", nullable = false)
    private ServiceCatalog serviceCatalog;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    // ── Scheduling ────────────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(name = "time_slot", nullable = false, length = 20)
    private TimeSlot timeSlot;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "scheduled_at", nullable = false, updatable = false)
    private LocalDateTime scheduledAt;

    @Column(name = "estimated_start_time")
    private LocalTime estimatedStartTime;

    @Column(name = "estimated_end_time")
    private LocalTime estimatedEndTime;

    // ── Status & Lifecycle ────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancelled_by")
    private Long cancelledBy;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    // ── Pricing ───────────────────────────────────────────────────────────────

    @Column(name = "total_price")
    private Integer totalPrice;

    @Column(name = "area_sq_ft")
    private Integer areaSqFt;

    @Column(name = "wall_count")
    private Integer wallCount;

    @Column(name = "item_count")
    private Integer itemCount;

    // ── Logistics ─────────────────────────────────────────────────────────────

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "attached_img_url", length = 1024)
    private String attachedImgUrl;

    @Column(name = "attached_video_url", length = 1024)
    private String attachedVideoUrl;

    @Column(name = "attached_audio_url", length = 1024)
    private String attachedAudioUrl;

    // ── Optimistic Lock ───────────────────────────────────────────────────────

    @Version
    private Long version;

    // ── Lifecycle Hooks ───────────────────────────────────────────────────────

    @PrePersist
    protected void onCreate() {
        if (this.status == null)      this.status     = AppointmentStatus.PENDING;
        if (this.scheduledAt == null) this.scheduledAt = LocalDateTime.now();
    }

    // ── Domain Helpers ────────────────────────────────────────────────────────

    public boolean canTransitionTo(AppointmentStatus next) {
        return this.status.canTransitionTo(next);
    }

    public boolean isOwnedByCustomer(Long customerId) {
        return this.customerId.equals(customerId);
    }

    public boolean isOwnedByProvider(Long providerId) {
        return this.provider != null && this.provider.getId().equals(providerId);
    }
}

