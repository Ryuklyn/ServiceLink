package com.servicelink.core.model.appointment;

import com.servicelink.core.model.common.TimeSlot;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.provider.ServiceCatalog;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private Provider provider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "servive_catalog_id", nullable = false)
    private ServiceCatalog serviceCatalog;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "time_slot", nullable = false)
    private TimeSlot timeSlot;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @Column(name = "address")
    private String address;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "attached_img_url", length =  1024)
    private String attachedImgUrl;

    @Column(name = "attached_video_url", length =  1024)
    private String attachedVideoUrl;

    @Column(name = "total_price")
    private Integer totalPrice;

    @PrePersist
    protected void onCreate() {
        if (this.status == null) this.status = AppointmentStatus.PENDING;
        if (this.scheduledAt == null) this.scheduledAt = LocalDateTime.now();
    }
}
