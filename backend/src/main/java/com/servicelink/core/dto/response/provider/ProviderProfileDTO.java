package com.servicelink.core.dto.response.provider;

import com.servicelink.core.dto.response.provider.portfolio.PortfolioResponseDTO;
import com.servicelink.core.dto.response.provider.service.ProviderServiceDTO;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class ProviderProfileDTO {

    private Long   id;
    private Long   userId;
    private String fullName;
    private String phone;
    private String businessName;
    private String email;
    private String bio;
    private String profilePictureUrl;

    private Long   primaryCategoryId;
    private String primaryCategoryName;
    private List<Long> certifiedCategoryIds;
    private String          otherService;
    private String certifiedCategories;
    private Integer         experienceYears;

    private Boolean isVerified;
    private Boolean isActive;
    private Boolean isOnline;
    private Boolean hasCompletedOnboarding;

    // ── Pro-orders eligibility ──────────────────────────────────────────
    // acceptsProOrders  = the provider's raw preference toggle, stored on
    //                     ProviderScheduleSettings (owned by AvailabilityTab).
    // proOrdersEligible = the ENFORCED value: true only when the provider's
    //                     subscription is a paid, active plan AND they have
    //                     opted in. Computed server-side in
    //                     ProviderPoolService#computeProOrdersEligible so
    //                     there is exactly one source of truth shared by
    //                     this profile DTO and the Provider Pool listing.
    //                     Never derive this on the frontend from isActive
    //                     alone — that mirrors it for UX only.
    private Boolean acceptsProOrders;
    private Boolean proOrdersEligible;

    // Location
    private String  baseDistrict;
    private String  serviceAreaText;
    private String  coveredDistricts;
    private Double  latitude;
    private Double  longitude;
    private Integer travelRadiusKm;

    // Performance
    private Double  averageRating;
    private Integer totalReviews;
    private Integer totalJobs;
    private Integer avgResponseMinutes;

    // Dimensional scores
    private Double punctualityScore;
    private Double qualityScore;
    private Double communicationScore;
    private Double valueScore;

    private Instant memberSince;

    private String kycReferenceNumber;

    // Nested summaries
    private List<ProviderServiceDTO>  services;
    private List<PortfolioResponseDTO>        portfolio;
    private List<ReviewDTO>           recentReviews;
}