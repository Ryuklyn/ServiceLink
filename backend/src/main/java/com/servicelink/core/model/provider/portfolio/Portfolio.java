package com.servicelink.core.model.provider.portfolio;

import com.servicelink.core.model.provider.Provider;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "portfolio")
@Getter @Setter @EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private Provider provider;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "service_category", nullable = false)
    private String serviceCategory; // e.g. "Electrical Wiring"

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "completion_date")
    private LocalDate completionDate; // stored as the 1st of the selected month

    @Column(name = "location")
    private String location;

    @Builder.Default
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC")
    private List<PortfolioMedia> media = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    /** Convenience helper to keep both sides of the relationship in sync. */
    public void addMedia(PortfolioMedia mediaItem) {
        media.add(mediaItem);
        mediaItem.setProject(this);
    }
}