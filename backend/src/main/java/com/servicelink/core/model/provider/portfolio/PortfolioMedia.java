package com.servicelink.core.model.provider.portfolio;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "portfolio_media")
@Getter @Setter @EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Portfolio project;

    @Column(name = "media_url",columnDefinition = "TEXT", nullable = false)
    private String mediaUrl; // Supabase public storage URL

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false)
    private MediaType mediaType;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "uploaded_at")
    private Instant uploadedAt;

    @PrePersist
    protected void onCreate() {
        this.uploadedAt = Instant.now();
    }

    public enum MediaType {
        IMAGE, VIDEO
    }
}
