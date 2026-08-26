package com.servicelink.core.model.provider;

import com.servicelink.core.model.provider.service.Category;
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

    // Was: @Enumerated(EnumType.STRING) private ServiceCategory category;
    // Categories are now admin-defined rows, not a fixed enum.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "sub_service_name", nullable = false)
    private String subServiceName;

    @Column(name = "default_duration")
    private String defaultDuration; // e.g., "35–45 mins"

    @Enumerated(EnumType.STRING)
    @Column(name = "pricing_unit", nullable = false)
    private PricingUnit pricingUnit; // PER_JOB, PER_SQFT, PER_WALL, PER_ITEM, PER_HOUR

    @Enumerated(EnumType.STRING)
    @Column(name = "estimation_mode")
    private EstimationMode estimationMode;

    @Column(name = "required_input_label")
    private String requiredInputLabel;

    @Column(name = "base_price")
    private Integer basePrice; // in NPR

    /**
     * Admin can deactivate a sub-service without deleting it.
     * Existing bookings are unaffected; new bookings cannot use it.
     */
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    public enum PricingUnit {
        PER_JOB,    // Fixed price (most sub-services)
        PER_SQFT,   // Full room painting, flooring
        PER_WALL,   // Touch-up painting
        PER_ITEM,   // Countable installs: fans, fixtures, taps
        PER_HOUR    // Hourly rate
    }

    public enum EstimationMode {
        FIXED,
        INPUT_BASED,
        INSPECTION_REQUIRED
    }
}