package com.servicelink.core.model.provider;

import com.servicelink.core.model.common.KycStatus;
import com.servicelink.core.model.common.KycSubmission;
import com.servicelink.core.model.common.ServiceCategory;
import com.servicelink.core.model.provider.portfolio.Portfolio;
import com.servicelink.core.model.provider.portfolio.PortfolioMedia;
import com.servicelink.core.model.provider.review.Review;
import com.servicelink.core.model.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Entity
@Table(name = "providers")
@Getter @Setter @EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Provider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
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

    @Column(name = "email", nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "primary_service", nullable = false)
    private ServiceCategory primaryService;

    @Column(name = "certified_categories", columnDefinition = "TEXT")
    private String certifiedCategories;

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

    @Column(name = "has_completed_onboarding")
    @Builder.Default
    private Boolean hasCompletedOnboarding = false;

    @Column(name = "referral_code", unique = true)
    private String referralCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referred_by_provider_id")
    private Provider referredBy;

    @Column(name = "referral_free_months_earned")
    @Builder.Default
    private Integer referralFreeMonthsEarned = 0;


    @Column(name = "is_online")
    private Boolean isOnline = false;

    @Column(name = "member_since")
    private Instant memberSince;

    // Services offered
    @Builder.Default
    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProviderService> services = new HashSet<>();

    // Reviews
    @Builder.Default
    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Review> reviews = new HashSet<>();

    // Portfolio (each Portfolio is a project, which can hold several PortfolioMedia items)
    @Builder.Default
    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Portfolio> portfolio = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        this.memberSince = Instant.now();
        if (this.referralCode == null) {
            this.referralCode = generateReferralCode();
        }
    }

    private String generateReferralCode() {
        return java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }


    public void syncFromKyc(KycSubmission kyc) {
        this.kycSubmission = kyc;
        this.fullName = kyc.getFullName();
        this.phone = kyc.getPhone();

        // The KYC form now sends the admin-created Category's numeric id
        // (e.g. "3") as primaryService instead of a legacy enum key (e.g.
        // "ELECTRICIAN"). ServiceCategory.valueOf() throws on the former, so
        // this is now guarded — legacy enum-key submissions still populate
        // this field as before; new categoryId-based submissions simply
        // don't touch it (getCertifiedCategoryIds() below is the source of
        // truth for those going forward).
        try {
            this.primaryService = ServiceCategory.valueOf(kyc.getPrimaryService());
        } catch (IllegalArgumentException | NullPointerException ignored) {
            // Not a legacy enum key — expected for new categoryId-based submissions.
        }

        this.otherService = kyc.getOtherService();
        this.experienceYears = kyc.getExperienceYears();
        this.bio = kyc.getBio();
        this.isVerified = kyc.getStatus() == KycStatus.APPROVED;

        // Business name isn't a KYC concept — default to legal name, never
        // overwrite a value the provider has already customized.
        if (this.businessName == null) {
            this.businessName = kyc.getFullName();
        }

        // Service area — genuinely sourced from KYC, same guard logic: only
        // seed on first sync, don't clobber a provider's later Settings edits
        // if syncFromKyc is ever re-run (re-verification, admin correction).
        if (this.baseDistrict == null) {
            this.baseDistrict = kyc.getPrimaryDistrict();
        }
        if (this.coveredDistricts == null) {
            this.coveredDistricts = kyc.getSecondaryDistricts();
        }
    }

    /**
     * Parses certifiedCategories (CSV, set by KycService.buildCertifiedCategories()
     * during approval) into real Category ids. Once the KYC form sends category
     * ids instead of legacy enum keys, this naturally becomes a clean id list —
     * any entry that doesn't parse as a number (old enum-key submissions, e.g.
     * "ELECTRICIAN") is silently skipped rather than breaking the whole list.
     *
     * Hand-written on purpose — Lombok's @Data only generates accessors for
     * actual fields (certifiedCategories -> getCertifiedCategories()); since
     * there's no certifiedCategoryIds field, there's nothing for Lombok to
     * generate here, so this coexists with the Lombok-generated getters
     * without any conflict.
     */
    public List<Long> getCertifiedCategoryIds() {
        if (certifiedCategories == null || certifiedCategories.isBlank()) return List.of();
        return Arrays.stream(certifiedCategories.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(s -> {
                    try {
                        return Long.valueOf(s);
                    } catch (NumberFormatException e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .distinct()
                .toList();
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

    /**
     * Returns portfolio projects that contain at least one media item of the
     * given type (e.g. projects with a video attached, or projects with photos).
     * Replaces the old getPortfolioByType(), which relied on a single
     * mediaType per Portfolio row — that no longer applies now that one
     * project can hold up to 5 photos + 1 video.
     */
    public List<Portfolio> getPortfolioByType(PortfolioMedia.MediaType mediaType) {
        return portfolio.stream()
                .filter(p -> p.getMedia().stream().anyMatch(m -> m.getMediaType() == mediaType))
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
}