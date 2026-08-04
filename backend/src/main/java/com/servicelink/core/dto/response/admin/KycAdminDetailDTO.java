package com.servicelink.core.dto.response.admin;

import lombok.Builder;
import lombok.Data;
import java.time.Instant;
import java.util.List;

@Data
@Builder
public class KycAdminDetailDTO {
    private Long id;
    private String referenceNumber;
    private String applicantIdentifier;
    private String status;

    // Personal
    private String fullName;
    private String dob;
    private String gender;
    private String phone;
    private String email;

    // Address
    private String province;
    private String district;
    private String municipality;
    private String ward;
    private String tole;

    // Professional
    private String primaryService;
    private String otherService;
    private List<String> additionalServices;
    private Integer experienceYears;
    private String primaryDistrict;
    private List<String> secondaryDistricts;
    private String travelRadius;
    private String bio;

    // Documents
    private String citizenshipFrontPath;
    private String citizenshipBackPath;
    private String photoPath;
    private String panPath;
    private List<String> professionalCertPaths;
    private String profilePhotoUrl;

    // Meta
    private Instant submittedAt;
    private Instant reviewedAt;
    private String reviewNotes;

    // Video audit (Option B)
    private String scheduledMeetLink;
    private Instant scheduledMeetAt;
}