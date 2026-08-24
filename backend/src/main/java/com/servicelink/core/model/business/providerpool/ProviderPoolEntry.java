package com.servicelink.core.model.business.providerpool;
import com.servicelink.core.model.provider.Provider;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Membership row for the organization's trusted Pro provider list
 * (prodashboard.md §7 "Provider Pool" — separate from Provider Directory).
 *
 * Performance fields here are the Pro-specific history (§7 "Important
 * performance rule"): they are only ever populated from actual completed
 * Pro Job Tickets, never inferred, and stay separate from the provider's
 * global ServiceLink rating.
 */
@Entity
@Table(
        name = "provider_pool_entries",
        uniqueConstraints = @UniqueConstraint(columnNames = {"organization_id", "provider_id"})
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderPoolEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "provider_id", nullable = false)
    private Provider provider;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProviderPoolStatus status;

    // Pro-specific history — null (not zero) until the provider has at
    // least one completed Pro Job Ticket. See §7: "Do not invent an SLA
    // score when there is insufficient Pro history."
    @Column(name = "pro_jobs_completed")
    private Integer proJobsCompleted;

    @Column(name = "attendance_rate")
    private Double attendanceRate;

    @Column(name = "on_time_rate")
    private Double onTimeRate;

    @Column(name = "added_at", nullable = false)
    private Instant addedAt;
}