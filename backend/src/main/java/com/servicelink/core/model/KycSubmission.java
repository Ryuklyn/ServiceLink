package com.servicelink.core.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "kyc_submissions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KycSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(nullable = false, unique = true)
    private String referenceNumber;

    // Personal
    private String fullName;
    private String dob;
    private String gender;
    private String phone;

    // Address (current)
    private String province;
    private String district;
    private String municipality;
    private String ward;
    private String tole;

    // Professional
    private String primaryService;
    private String otherService;
    private String additionalServices;   // JSON array stored as text
    private Integer experienceYears;
    private String primaryDistrict;
    private String secondaryDistricts;   // JSON array stored as text
    private String travelRadius;
    private String bio;

    // Document paths (S3/Minio keys)
    private String citizenshipFrontPath;
    private String citizenshipBackPath;
    private String photoPath;
    private String panPath;
    private String professionalCertPaths; // JSON array

    @Enumerated(EnumType.STRING)
    private KycStatus status;

    private Instant submittedAt;
    private Instant reviewedAt;
    private String reviewNotes;
}
