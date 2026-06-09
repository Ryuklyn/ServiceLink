package com.servicelink.core.model.provider;

import com.servicelink.core.model.common.KycStatus;
import com.servicelink.core.model.common.KycSubmission;
import com.servicelink.core.model.common.ServiceCategory;
import com.servicelink.core.model.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Entity
@Table(name = "providers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Provider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kyc_submission_id", nullable = false)
    private KycSubmission kycSubmission;

    // Derived from KYC
    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "phone", nullable = false)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "primary_service", nullable = false)
    private ServiceCategory primaryService;

    @Column(columnDefinition = "TEXT")
    private String otherService;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(columnDefinition = "TEXT")
    private String bio;

    // Profile info
    @Column(name = "business_name")
    private String businessName;

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    // Performance
    @Column(name = "total_jobs")
    private Integer totalJobs = 0;

    @Column(name = "avg_response_minutes")
    private Integer avgResponseMinutes;

    // Location
    @Column(name = "base_district")
    private String baseDistrict;

    @Column(name = "service_area_text")
    private String serviceAreaText;

    @Column(name = "covered_districts", columnDefinition = "TEXT")
    private String coveredDistricts;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "travel_radius_km")
    private Integer travelRadiusKm;

    // Ratings
    @Column(name = "average_rating")
    private Double averageRating = 5.0;

    @Column(name = "total_reviews")
    private Integer totalReviews = 0;

    private Double punctualityScore;
    private Double qualityScore;
    private Double communicationScore;
    private Double valueScore;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "is_online")
    private Boolean isOnline = false;

    @Column(name = "member_since")
    private Instant memberSince;

    // Services offered
//    @Builder.Default
//    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL, orphanRemoval = true)
//    private List<ProviderService> services = new ArrayList<>();
    @Builder.Default
    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProviderService> services = new HashSet<>();

    // Reviews
//    @Builder.Default
//    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL, orphanRemoval = true)
//    private List<Review> reviews = new ArrayList<>();
    @Builder.Default
    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Review> reviews = new HashSet<>();

    // Portfolio
//    @Builder.Default
//    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL, orphanRemoval = true)
//    private List<Portfolio> portfolio = new ArrayList<>();
    @Builder.Default
    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Portfolio> portfolio = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        this.memberSince = Instant.now();
        this.isVerified = false;
    }

    public void syncFromKyc(KycSubmission kyc) {
        this.kycSubmission = kyc;
        this.fullName = kyc.getFullName();
        this.phone = kyc.getPhone();
        this.primaryService = ServiceCategory.valueOf(kyc.getPrimaryService());
        this.otherService = kyc.getOtherService();
        this.experienceYears = kyc.getExperienceYears();
        this.bio = kyc.getBio();
        this.isVerified = kyc.getStatus() == KycStatus.APPROVED;
    }

    public Double calculateAverageRating() {
        if (reviews.isEmpty()) return 5.0;
        return reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(5.0);
    }
    public void updateRatingMetrics() {
        if (reviews.isEmpty()) {
            this.averageRating = 5.0;
            this.totalReviews = 0;
            this.punctualityScore = null;
            this.qualityScore = null;
            this.communicationScore = null;
            this.valueScore = null;
            return;
        }

        this.averageRating = calculateAverageRating();
        this.totalReviews = reviews.size();

        this.punctualityScore = reviews.stream()
                .map(Review::getPunctualityScore)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);

        this.qualityScore = reviews.stream()
                .map(Review::getQualityScore)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);

        this.communicationScore = reviews.stream()
                .map(Review::getCommunicationScore)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);

        this.valueScore = reviews.stream()
                .map(Review::getValueScore)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);
    }

    public Portfolio getPrimaryPortfolio() {
        return portfolio.stream()
                .filter(Portfolio::getIsPrimary)
                .findFirst()
                .orElse(null);
    }

    public List<Portfolio> getPortfolioByType(Portfolio.MediaType mediaType) {
        return portfolio.stream()
                .filter(p -> p.getMediaType() == mediaType)
                .collect(Collectors.toList());
    }

    public List<Portfolio> getPortfolioByCategory(ServiceCategory category) {
        return portfolio.stream()
                .filter(p -> category.name().equals(p.getServiceCategory()))
                .collect(Collectors.toList());
    }

    public void addReview(Review review) {
        this.reviews.add(review);
        review.setProvider(this);
        updateRatingMetrics();
    }

    public void removeReview(Review review) {
        this.reviews.remove(review);
        review.setProvider(null);
        updateRatingMetrics();
    }

    public void addPortfolioItem(Portfolio portfolioItem) {
        this.portfolio.add(portfolioItem);
        portfolioItem.setProvider(this);
    }

    public void setPrimaryPortfolio(Long portfolioId) {
        this.portfolio.forEach(p -> p.setIsPrimary(false));

        Portfolio primary = this.portfolio.stream()
                .filter(p -> p.getId().equals(portfolioId))
                .findFirst()
                .orElse(null);

        if (primary != null) {
            primary.setIsPrimary(true);
        }
    }
}