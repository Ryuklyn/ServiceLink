package com.servicelink.core.model.business;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;


@Entity
@Table (name = "organizations")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Organization {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private  long id;

    @Column(nullable = false, length = 200)
    private String companyName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BusinessType businessType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CompanySize companySize;

    @Column(nullable = false, unique = true, length = 150)
    private String workEmail;

    @Column(nullable = false, length = 20)
    private String contactNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RegistrationStatus registrationStatus = RegistrationStatus.PENDING;

    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Workspace> workspaces;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {        createdAt = LocalDateTime.now();        updatedAt = LocalDateTime.now();    }
    @PreUpdate
    protected void onUpdate() {        updatedAt = LocalDateTime.now();    }
}
