package com.servicelink.core.model.provider;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(
        name = "provider_services",
        uniqueConstraints = {@UniqueConstraint(columnNames = {"provider_id", "catalog_id"})}
)
@Getter  @Setter @EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private Provider provider;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "catalog_id", nullable = false)
    private ServiceCatalog catalogItem;


    /**
     * The fixed custom price the individual provider charges for this service.
     * Changed from min/max range to a single field, and typed as Integer to match NPR pricing.
     */
    @Column(name = "custom_price", nullable = false)
    private Integer customPrice;

    /**
     * Provider can override admin's defaultDuration if their workflow differs.
     * Falls back to catalogItem.defaultDuration if null.
     */
    @Column(name = "custom_duration")
    private String customDuration;

    @Column(name = "is_available", nullable = false)
    @Builder.Default
    private Boolean isAvailable = true;

    /**
     * Returns effective duration — provider override takes precedence.
     */
    public String getEffectiveDuration() {
        return (customDuration != null && !customDuration.isBlank())
                ? customDuration
                : catalogItem.getDefaultDuration();
    }
}