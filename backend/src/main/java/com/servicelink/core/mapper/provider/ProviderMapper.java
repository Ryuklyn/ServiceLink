package com.servicelink.core.mapper.provider;

// com/servicelink/core/mapper/provider/ProviderMapper.java
import com.servicelink.core.dto.response.provider.*;
import com.servicelink.core.dto.response.provider.portfolio.PortfolioResponseDTO;
import com.servicelink.core.mapper.provider.portfolio.PortfolioMapper;
import com.servicelink.core.model.provider.*;
import com.servicelink.core.model.provider.portfolio.Portfolio;
import com.servicelink.core.model.provider.review.Review;
import com.servicelink.core.model.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ProviderMapper {

    // Delegates actual Portfolio -> PortfolioResponseDTO mapping to
    // PortfolioMapper so there's one source of truth, shared with the
    // standalone PortfolioController/PortfolioService stack.
    private final PortfolioMapper portfolioMapper;

    // ── Provider full profile ─────────────────────────────────────────────────

    public ProviderProfileDTO toProfileDTO(Provider p,
                                           List<ReviewDTO> recentReviews) {
        return ProviderProfileDTO.builder()
                .id(p.getId())
                .fullName(p.getFullName())
                .phone(p.getPhone())
                .email(p.getUser() != null ? p.getUser().getEmail() : null)
                .businessName(p.getBusinessName())
                .bio(p.getBio())
                .profilePictureUrl(p.getProfilePictureUrl())
                .primaryService(p.getPrimaryService())
                .otherService(p.getOtherService())
                .certifiedCategories(p.getCertifiedCategories())
                .experienceYears(p.getExperienceYears())
                .isVerified(p.getIsVerified())
                .isActive(p.getIsActive())
                .hasCompletedOnboarding(p.getHasCompletedOnboarding())
                .isOnline(p.getIsOnline())
                .baseDistrict(p.getBaseDistrict())
                .serviceAreaText(p.getServiceAreaText())
                .coveredDistricts(p.getCoveredDistricts())
                .latitude(p.getLatitude())
                .longitude(p.getLongitude())
                .travelRadiusKm(p.getTravelRadiusKm())
                .averageRating(p.getAverageRating())
                .totalReviews(p.getTotalReviews())
                .totalJobs(p.getTotalJobs())
                .avgResponseMinutes(p.getAvgResponseMinutes())
                .punctualityScore(p.getPunctualityScore())
                .qualityScore(p.getQualityScore())
                .communicationScore(p.getCommunicationScore())
                .valueScore(p.getValueScore())
                .memberSince(p.getMemberSince())
                .services(p.getServices().stream().map(this::toProviderServiceDTO).toList())
                .portfolio(p.getPortfolio().stream().map(this::toPortfolioDTO).toList())
                .recentReviews(recentReviews)
                .build();
    }

    // ── ProviderService ───────────────────────────────────────────────────────

    public ProviderServiceDTO toProviderServiceDTO(ProviderService ps) {
        ServiceCatalog c = ps.getCatalogItem();
        return ProviderServiceDTO.builder()
                .id(ps.getId())
                .catalogId(c.getId())
                .subServiceName(c.getSubServiceName())
                .category(c.getCategory())
                .pricingUnit(c.getPricingUnit())
                .customPrice(ps.getCustomPrice())
                .effectiveDuration(ps.getEffectiveDuration())
                .isAvailable(ps.getIsAvailable())
                .build();
    }

    // ── Portfolio ─────────────────────────────────────────────────────────────

    public PortfolioResponseDTO toPortfolioDTO(Portfolio portfolio) {
        return portfolioMapper.toResponse(portfolio);
    }

    // ── Review ────────────────────────────────────────────────────────────────

    public ReviewDTO toReviewDTO(Review review) {
        User customer = review.getCustomer();
        // Use username or full name depending on your User model fields
        String displayName = customer != null ? customer.getFullName() : "Anonymous";

        return ReviewDTO.builder()
                .id(review.getId())
                .customerName(displayName)
                .rating(review.getRating())
                .comment(review.getComment())
                .serviceName(review.getServiceName())
                .punctualityScore(review.getPunctualityScore())
                .qualityScore(review.getQualityScore())
                .communicationScore(review.getCommunicationScore())
                .valueScore(review.getValueScore())
                .isVerifiedBooking(review.getIsVerifiedBooking())
                .createdAt(review.getCreatedAt())
                .build();
    }

    // ── ServiceCatalog ────────────────────────────────────────────────────────

    public ServiceCatalogDTO toCatalogDTO(ServiceCatalog sc) {
        return ServiceCatalogDTO.builder()
                .id(sc.getId())
                .category(sc.getCategory())
                .subServiceName(sc.getSubServiceName())
                .defaultDuration(sc.getDefaultDuration())
                .pricingUnit(sc.getPricingUnit())
                .basePrice(sc.getBasePrice())
                .isActive(sc.getIsActive())
                .build();
    }
}