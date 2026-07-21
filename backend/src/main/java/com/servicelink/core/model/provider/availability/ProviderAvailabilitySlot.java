package com.servicelink.core.model.provider.availability;

import com.servicelink.core.model.common.TimeSlot;
import com.servicelink.core.model.provider.Provider;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(
        name = "provider_availability_slots",
        uniqueConstraints = @UniqueConstraint(columnNames = {"provider_id", "slot_date", "period"})
)
@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderAvailabilitySlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private Provider provider;

    @Column(name = "slot_date", nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TimeSlot period;

    @Column(name = "is_available", nullable = false)
    @Builder.Default
    private Boolean isAvailable = true;

    /** Only meaningful when isAvailable = false. Never exposed on the public/customer endpoint. */
    @Column(columnDefinition = "TEXT")
    private String reason;
}
