package com.servicelink.core.dto.response.provider;

import com.servicelink.core.model.common.ServiceCategory;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class ProviderProfileDTO {

    private Long   id;
    private String fullName;
    private String phone;
    private String businessName;
    private String bio;
    private String profilePictureUrl;

    private ServiceCategory primaryService;
    private String          otherService;
    private Integer         experienceYears;

    private Boolean isVerified;
    private Boolean isActive;
    private Boolean isOnline;

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

    // Nested summaries
    private List<ProviderServiceDTO>  services;
    private List<PortfolioDTO>        portfolio;
    private List<ReviewDTO>           recentReviews;
}