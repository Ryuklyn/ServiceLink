package com.servicelink.core.model.business.job;

import com.servicelink.core.model.provider.ServiceCatalog;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "pro_job_tickets", indexes = {
        @Index(name = "idx_pro_job_org_status", columnList = "organization_id,status"),
        @Index(name = "idx_pro_job_schedule", columnList = "scheduled_date,start_time")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ProJobTicket {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_catalog_id", nullable = false)
    private ServiceCatalog serviceCatalog;

    @Column(name = "created_by_user_id", nullable = false)
    private Long createdByUserId;
    @Column(nullable = false) private String title;
    @Column(nullable = false) private Integer workersRequired;
    @Column(name = "scheduled_date", nullable = false) private LocalDate scheduledDate;
    @Column(name = "start_time", nullable = false) private LocalTime startTime;
    @Column(name = "end_time", nullable = false) private LocalTime endTime;
    @Column(nullable = false, length = 512) private String location;
    private Double latitude;
    private Double longitude;
    @Column(columnDefinition = "TEXT") private String instructions;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private ProPricingModel pricingModel;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal businessPrice;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal providerEarning;
    @Enumerated(EnumType.STRING) @Column(nullable = false) @Builder.Default private ProJobStatus status = ProJobStatus.REQUESTED;
    @Column(updatable = false) private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); updatedAt = createdAt; }
    @PreUpdate void onUpdate() { updatedAt = LocalDateTime.now(); }
}
