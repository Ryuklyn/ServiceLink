package com.servicelink.core.model.provider;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "portfolio")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private Provider provider;

    @Column(name = "media_url", nullable = false)
    private String mediaUrl; // Supabase storage URL (e.g., https://xyz.supabase.co/storage/v1/object/...)

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false)
    private MediaType mediaType; // IMAGE or VIDEO

    @Column(name = "caption", columnDefinition = "TEXT")
    private String caption; // Optional description: "Before/After kitchen wiring"

    @Column(name = "service_category")
    private String serviceCategory; // e.g., "ELECTRICIAN" - for filtering

    @Column(name = "is_primary")
    private Boolean isPrimary = false; // Show first in gallery

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
