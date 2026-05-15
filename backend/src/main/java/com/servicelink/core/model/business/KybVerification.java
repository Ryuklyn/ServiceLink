package com.servicelink.core.model.business;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Entity
@Table (name = "kyb_verifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class KybVerification {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne (fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false, unique = true)
    private Organization organization;

    @Column(nullable = false,length = 50)
    private String taxId;

    // Stored as Supabase public URL — image lives in Supabase, URL in MySQL
    @Column(length = 500)
    private String documentImgUrl;

    @Column(nullable = false)
    private Boolean authorizedConfirmed;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private KybStatus status = KybStatus.PENDING;

    private String reviewNote; // admin rejection/approval note

    @Column(nullable = false)
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }

}
