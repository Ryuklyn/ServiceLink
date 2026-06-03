package com.servicelink.core.model.provider;


import com.servicelink.core.model.common.ServiceCategory;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "service_catalog")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceCatalog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServiceCategory category;

    @Column(name = "sub_service_name", nullable = false)
    private String subServiceName;

    @Column(name = "default_duration")
    private String defaultDuration; // e.g., "35–45 mins"

    @Enumerated(EnumType.STRING)
    @Column(name = "pricing_unit")
    private PricingUnit pricingUnit; // HOURLY, PER_SQFT, PER_JOB, PER_WALL

    @Column(name = "base_price")
    private Integer basePrice; // in NPR

    public enum PricingUnit {
        HOURLY, PER_SQFT, PER_JOB, PER_WALL
    }
}

