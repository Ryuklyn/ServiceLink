package com.servicelink.core.model.business.job;

import com.servicelink.core.model.provider.Provider;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "pro_job_sla")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ProJobSLA {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_ticket_id", nullable = false)
    private ProJobTicket jobTicket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private Provider provider;

    @Column(name = "expected_arrival", nullable = false)
    private Instant expectedArrival;

    @Column(name = "actual_arrival")
    private Instant actualArrival;

    @Column(name = "arrival_difference_minutes")
    private Long arrivalDifferenceMinutes;

    @Enumerated(EnumType.STRING)
    @Column(name = "compliance_status", nullable = false)
    private SlaComplianceStatus complianceStatus;
}
