package com.servicelink.core.model.common;

import com.servicelink.core.model.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    /**
     * The User entity for existing registered users.
     * NULL for new provider applicants who haven't created an account yet.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    /**
     * The primary identifier used at verification time — E.164 phone or email.
     * Populated for ALL submissions (new and existing users).
     */
    @Column(nullable = false, unique = true)
    private String applicantIdentifier;

    @Column(nullable = false, unique = true)
    private String referenceNumber;

    // ── Personal ──────────────────────────────────────────────────────────────
    private String fullName;
    private String dob;
    private String gender;
    private String phone;
    private String email;

    // ── Address ───────────────────────────────────────────────────────────────
    private String province;
    private String district;
    private String municipality;
    private String ward;
    private String tole;

    // ── Professional ──────────────────────────────────────────────────────────
    private String  primaryService;
    private String  otherService;
    @Column(columnDefinition = "TEXT")
    private String  additionalServices;     // JSON array stored as text
    private Integer experienceYears;
    private String  primaryDistrict;
    @Column(columnDefinition = "TEXT")
    private String  secondaryDistricts;     // JSON array stored as text
    private String  travelRadius;
    @Column(columnDefinition = "TEXT")
    private String  bio;

    // ── Document paths ────────────────────────────────────────────────────────
    private String citizenshipFrontPath;
    private String citizenshipBackPath;
    private String photoPath;
    private String panPath;
    @Column(columnDefinition = "TEXT")
    private String professionalCertPaths;   // JSON array
    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;

    // ── Status ────────────────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    private KycStatus status;

    private Instant submittedAt;
    private Instant reviewedAt;
    @Column(columnDefinition = "TEXT")
    private String  reviewNotes;
}
