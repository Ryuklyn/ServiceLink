package com.servicelink.core.model.business.job;

import com.servicelink.core.model.provider.Provider;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "pro_job_assignments", uniqueConstraints = {
    @UniqueConstraint(name = "uk_pro_job_provider", columnNames = {"job_ticket_id", "provider_id"})
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class JobAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_ticket_id", nullable = false)
    private ProJobTicket jobTicket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private Provider provider;

    @Column(name = "required_skill", nullable = true)
    private String requiredSkill;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = true)
    @Builder.Default
    private JobAssignmentStatus status = JobAssignmentStatus.PENDING;

    @Column(name = "assigned_at", nullable = false)
    private Instant assignedAt;

    @PrePersist
    protected void onCreate() {
        this.assignedAt = Instant.now();
    }
}
