package com.servicelink.core.model.business.job;

import com.servicelink.core.model.provider.Provider;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "pro_job_attendance")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_ticket_id", nullable = false)
    private ProJobTicket jobTicket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private Provider provider;

    @Column(name = "check_in_time")
    private Instant checkInTime;

    @Column(name = "check_out_time")
    private Instant checkOutTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;

    private Double latitude;
    private Double longitude;

    @Column(name = "distance_from_job")
    private Double distanceFromJob;

    @Column(name = "location_verified")
    private Boolean locationVerified;

    @Column(name = "rejection_reason")
    private String rejectionReason;
}
