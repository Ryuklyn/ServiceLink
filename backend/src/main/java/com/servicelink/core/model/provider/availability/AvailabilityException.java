package com.servicelink.core.model.provider.availability;

import com.servicelink.core.model.common.TimeSlot;
import com.servicelink.core.model.provider.Provider;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "availability_exceptions")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AvailabilityException {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private Provider provider;

    @Column(name = "date_start", nullable = false)
    private LocalDate dateStart;

    @Column(name = "date_end", nullable = false)
    private LocalDate dateEnd; // single-date exceptions: dateStart == dateEnd

    @Enumerated(EnumType.STRING)
    @Column
    private TimeSlot period; // null = whole day (leave, or Pro auto-lock)

    /** Plain string — whatever the dropdown value was, e.g. "Personal Work", "Holiday", "Pro assignment". */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}