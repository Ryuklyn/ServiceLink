package com.servicelink.core.model.business;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table (name = "workspaces")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Workspace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 300)
    private String primaryBranchLocation;

    // Stored as comma-separated values; or use @ElementCollection if you prefer a join table
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "workspace_services", joinColumns = @JoinColumn(name = "workspace_id"))
    @Column(name = "service_name")
    private List<String> preferredServices;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();    }

    @PreUpdate    protected void onUpdate() {updatedAt = LocalDateTime.now();}
}
