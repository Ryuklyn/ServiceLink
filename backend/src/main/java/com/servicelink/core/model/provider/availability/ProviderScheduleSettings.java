package com.servicelink.core.model.provider.availability;

import com.servicelink.core.model.common.TimeSlot;
import com.servicelink.core.model.provider.Provider;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "provider_schedule_settings")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ProviderScheduleSettings {

    @Id
    private Long providerId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "provider_id")
    private Provider provider;

    /** 0=Sun ... 6=Sat, matches the frontend WEEKDAYS array. Defaults to all 7 days. */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "provider_working_days", joinColumns = @JoinColumn(name = "provider_id"))
    @Column(name = "day_of_week")
    @Builder.Default
    private Set<Integer> workingDays = new HashSet<>(Set.of(0, 1, 2, 3, 4, 5, 6));

    /** Applies uniformly to every working day — not per-day. Defaults to all 3 slots. */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "provider_default_slots", joinColumns = @JoinColumn(name = "provider_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "period")
    @Builder.Default
    private Set<TimeSlot> defaultSlots = new HashSet<>(Set.of(TimeSlot.MORNING, TimeSlot.AFTERNOON, TimeSlot.EVENING));

    @Column(name = "accepts_pro_orders", nullable = false)
    @Builder.Default
    private Boolean acceptsProOrders = false;
}