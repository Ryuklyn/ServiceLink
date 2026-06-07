package com.servicelink.core.service.provider;

// com/servicelink/core/service/provider/ProviderProfileService.java
import com.servicelink.core.dto.request.provider.*;
import com.servicelink.core.dto.response.provider.*;
import com.servicelink.core.exception.BusinessException;
import com.servicelink.core.exception.ConflictException;
import com.servicelink.core.exception.ResourceNotFoundException;
import com.servicelink.core.mapper.provider.ProviderMapper;
import com.servicelink.core.model.appointment.Appointment;
import com.servicelink.core.model.appointment.AppointmentStatus;
import com.servicelink.core.model.common.ServiceCategory;
import com.servicelink.core.model.provider.*;
import com.servicelink.core.model.user.User;
import com.servicelink.core.repository.appointment.AppointmentRepository;
import com.servicelink.core.repository.appointment.ProviderRepository;
import com.servicelink.core.repository.appointment.ProviderServiceRepository;
import com.servicelink.core.repository.appointment.ServiceCatalogRepository;
import com.servicelink.core.repository.appointment.PortfolioRepository;
import com.servicelink.core.repository.appointment.ReviewRepository;
import com.servicelink.core.storage.SupabaseStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProviderProfileService {

    private final ProviderRepository         providerRepo;
    private final ProviderServiceRepository  providerServiceRepo;
    private final ServiceCatalogRepository   catalogRepo;
    private final ReviewRepository           reviewRepo;
    private final PortfolioRepository        portfolioRepo;
    private final AppointmentRepository      appointmentRepo;
    private final SupabaseStorageService     storageService;
    private final ProviderMapper             mapper;

    // ══════════════════════════════════════════════════════════════════════════
    // PUBLIC PROFILE (no auth required)
    // ══════════════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public ProviderProfileDTO getPublicProfile(Long providerId) {
        Provider provider = providerRepo.findByIdWithFullDetails(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider", providerId));

        List<ReviewDTO> recent = reviewRepo
                .findTopByProviderId(providerId, 5)
                .stream()
                .map(mapper::toReviewDTO)
                .toList();

        return mapper.toProfileDTO(provider, recent);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PROVIDER OWN PROFILE
    // ══════════════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public ProviderProfileDTO getMyProfile(Long userId) {
        Provider provider = resolveActiveProvider(userId);

        List<ReviewDTO> recent = reviewRepo
                .findTopByProviderId(provider.getId(), 5)
                .stream()
                .map(mapper::toReviewDTO)
                .toList();

        return mapper.toProfileDTO(provider, recent);
    }

    @Transactional
    public ProviderProfileDTO updateMyProfile(Long userId, UpdateProviderProfileDTO req) {
        Provider provider = resolveActiveProvider(userId);

        if (req.getBusinessName()    != null) provider.setBusinessName(req.getBusinessName());
        if (req.getBio()             != null) provider.setBio(req.getBio());
        if (req.getExperienceYears() != null) provider.setExperienceYears(req.getExperienceYears());
        if (req.getBaseDistrict()    != null) provider.setBaseDistrict(req.getBaseDistrict());
        if (req.getServiceAreaText() != null) provider.setServiceAreaText(req.getServiceAreaText());
        if (req.getCoveredDistricts()!= null) provider.setCoveredDistricts(req.getCoveredDistricts());
        if (req.getLatitude()        != null) provider.setLatitude(req.getLatitude());
        if (req.getLongitude()       != null) provider.setLongitude(req.getLongitude());
        if (req.getTravelRadiusKm()  != null) provider.setTravelRadiusKm(req.getTravelRadiusKm());

        providerRepo.save(provider);
        log.info("Provider {} updated their profile", provider.getId());

        return getMyProfile(userId);
    }

    @Transactional
    public ProviderProfileDTO updateOnlineStatus(Long userId, boolean isOnline) {
        Provider provider = resolveActiveProvider(userId);
        provider.setIsOnline(isOnline);
        providerRepo.save(provider);
        log.info("Provider {} set isOnline={}", provider.getId(), isOnline);
        return getMyProfile(userId);
    }

    /**
     * Upload a new profile picture to Supabase and update the URL.
     * Old picture is NOT deleted from Supabase (orphan cleanup is a separate job).
     */
    @Transactional
    public ProviderProfileDTO uploadProfilePicture(Long userId, MultipartFile file) throws Exception {
        Provider provider = resolveActiveProvider(userId);

        String url = storageService.uploadFile(file, "profile-pictures");
        provider.setProfilePictureUrl(url);
        providerRepo.save(provider);

        log.info("Provider {} updated profile picture -> {}", provider.getId(), url);
        return getMyProfile(userId);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PORTFOLIO
    // ══════════════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public List<PortfolioDTO> getMyPortfolio(Long userId) {
        Provider provider = resolveActiveProvider(userId);
        return portfolioRepo
                .findByProvider_IdOrderByIsPrimaryDescUploadedAtDesc(provider.getId())
                .stream()
                .map(mapper::toPortfolioDTO)
                .toList();
    }

    /**
     * Upload a portfolio image or video.
     * mediaType param should be "IMAGE" or "VIDEO".
     */
    @Transactional
    public PortfolioDTO addPortfolioItem(Long userId,
                                         MultipartFile file,
                                         String caption,
                                         String serviceCategory,
                                         String mediaTypeStr) throws Exception {
        Provider provider = resolveActiveProvider(userId);

        Portfolio.MediaType mediaType;
        try {
            mediaType = Portfolio.MediaType.valueOf(mediaTypeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("mediaType must be IMAGE or VIDEO", "INVALID_MEDIA_TYPE");
        }

        String folder = mediaType == Portfolio.MediaType.VIDEO ? "portfolio/videos" : "portfolio/images";
        String url    = storageService.uploadFile(file, folder);

        Portfolio item = Portfolio.builder()
                .provider(provider)
                .mediaUrl(url)
                .mediaType(mediaType)
                .caption(caption)
                .serviceCategory(serviceCategory)
                .isPrimary(false)
                .build();

        Portfolio saved = portfolioRepo.save(item);
        log.info("Provider {} added portfolio item {}", provider.getId(), saved.getId());

        return mapper.toPortfolioDTO(saved);
    }

    @Transactional
    public PortfolioDTO updatePortfolioCaption(Long userId, Long portfolioId, String caption) {
        Provider  provider  = resolveActiveProvider(userId);
        Portfolio portfolio = portfolioRepo.findByIdAndProvider_Id(portfolioId, provider.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio item", portfolioId));

        portfolio.setCaption(caption);
        return mapper.toPortfolioDTO(portfolioRepo.save(portfolio));
    }

    @Transactional
    public void deletePortfolioItem(Long userId, Long portfolioId) {
        Provider  provider  = resolveActiveProvider(userId);
        Portfolio portfolio = portfolioRepo.findByIdAndProvider_Id(portfolioId, provider.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio item", portfolioId));

        portfolioRepo.delete(portfolio);
        log.info("Provider {} deleted portfolio item {}", provider.getId(), portfolioId);
    }

    @Transactional
    public PortfolioDTO setPrimaryPortfolioItem(Long userId, Long portfolioId) {
        Provider provider = resolveActiveProvider(userId);

        // Verify ownership
        portfolioRepo.findByIdAndProvider_Id(portfolioId, provider.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio item", portfolioId));

        portfolioRepo.clearPrimaryForProvider(provider.getId());

        Portfolio item = portfolioRepo.findById(portfolioId).get();
        item.setIsPrimary(true);
        return mapper.toPortfolioDTO(portfolioRepo.save(item));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // REVIEWS
    // ══════════════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public Page<ReviewDTO> getProviderReviews(Long providerId, Pageable pageable) {
        return reviewRepo.findByProviderIdWithCustomer(providerId, pageable)
                .map(mapper::toReviewDTO);
    }

    @Transactional(readOnly = true)
    public Page<ReviewDTO> getMyReviewsAsCustomer(Long customerId, Pageable pageable) {
        return reviewRepo.findByCustomerIdWithProvider(customerId, pageable)
                .map(mapper::toReviewDTO);
    }

    /**
     * Customer submits a review after a COMPLETED appointment.
     * One review per appointment — duplicate check enforced.
     */
    @Transactional
    public ReviewDTO createReview(User customer, CreateReviewDTO req) {
        // Validate appointment is completed and owned by customer
        Appointment appointment = appointmentRepo
                .findByIdAndCustomerId(req.getAppointmentId(), customer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", req.getAppointmentId()));

        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw new BusinessException(
                    "You can only review a completed appointment", "REVIEW_NOT_ELIGIBLE");
        }

        if (reviewRepo.existsByCustomer_IdAndAppointmentId(customer.getId(), req.getAppointmentId())) {
            throw new ConflictException(
                    "You have already reviewed this appointment", "DUPLICATE_REVIEW");
        }

        Provider provider = providerRepo.findById(req.getProviderId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider", req.getProviderId()));

        Review review = Review.builder()
                .provider(provider)
                .customer(customer)
                .appointmentId(req.getAppointmentId())
                .rating(req.getRating())
                .comment(req.getComment())
                .punctualityScore(req.getPunctualityScore())
                .qualityScore(req.getQualityScore())
                .communicationScore(req.getCommunicationScore())
                .valueScore(req.getValueScore())
                .serviceName(appointment.getServiceCatalog().getSubServiceName())
                .isVerifiedBooking(true)
                .build();

        reviewRepo.save(review);

        // Update provider rating metrics in-memory then persist
        provider.addReview(review);
        providerRepo.save(provider);

        log.info("Customer {} reviewed provider {} for appointment {}",
                customer.getId(), provider.getId(), req.getAppointmentId());

        return mapper.toReviewDTO(review);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PROVIDER SERVICES  (Admin / Postman managed)
    // ══════════════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public List<ProviderServiceDTO> getServicesForProvider(Long providerId) {
        return providerServiceRepo.findByProvider_Id(providerId)
                .stream()
                .map(mapper::toProviderServiceDTO)
                .toList();
    }

    /** Admin registers a new sub-service offering for a provider. */
    @Transactional
    public ProviderServiceDTO addServiceToProvider(Long providerId, CreateProviderServiceDTO req) {
        Provider provider = providerRepo.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider", providerId));

        ServiceCatalog catalog = catalogRepo.findByIdAndIsActiveTrue(req.getCatalogId())
                .orElseThrow(() -> new ResourceNotFoundException("ServiceCatalog", req.getCatalogId()));

        // Duplicate guard
        providerServiceRepo.findByProviderIdAndCatalogId(providerId, req.getCatalogId())
                .ifPresent(existing -> {
                    throw new ConflictException(
                            "Provider already offers this catalog item", "PROVIDER_SERVICE_DUPLICATE");
                });

        ProviderService ps = ProviderService.builder()
                .provider(provider)
                .catalogItem(catalog)
                .customPrice(req.getCustomPrice())
                .customDuration(req.getCustomDuration())
                .isAvailable(req.getIsAvailable() != null ? req.getIsAvailable() : true)
                .build();

        return mapper.toProviderServiceDTO(providerServiceRepo.save(ps));
    }

    /** Admin updates price/duration/availability of a provider-service mapping. */
    @Transactional
    public ProviderServiceDTO updateProviderService(Long providerServiceId,
                                                    UpdateProviderServiceDTO req) {
        ProviderService ps = providerServiceRepo.findById(providerServiceId)
                .orElseThrow(() -> new ResourceNotFoundException("ProviderService", providerServiceId));

        if (req.getCustomPrice()    != null) ps.setCustomPrice(req.getCustomPrice());
        if (req.getCustomDuration() != null) ps.setCustomDuration(req.getCustomDuration());
        if (req.getIsAvailable()    != null) ps.setIsAvailable(req.getIsAvailable());

        return mapper.toProviderServiceDTO(providerServiceRepo.save(ps));
    }

    /** Admin removes a provider-service mapping. */
    @Transactional
    public void deleteProviderService(Long providerServiceId) {
        ProviderService ps = providerServiceRepo.findById(providerServiceId)
                .orElseThrow(() -> new ResourceNotFoundException("ProviderService", providerServiceId));
        providerServiceRepo.delete(ps);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // SERVICE CATALOG  (Admin / Postman managed)
    // ══════════════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public List<ServiceCatalogDTO> getCatalogByCategory(ServiceCategory category) {
        return catalogRepo
                .findByCategoryAndIsActiveTrueOrderBySubServiceNameAsc(category)
                .stream()
                .map(mapper::toCatalogDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ServiceCatalogDTO> getAllActiveCatalog() {
        return catalogRepo
                .findByIsActiveTrueOrderByCategoryAscSubServiceNameAsc()
                .stream()
                .map(mapper::toCatalogDTO)
                .toList();
    }

    /** Admin creates a new catalog sub-service entry. */
    @Transactional
    public ServiceCatalogDTO createCatalogItem(CreateServiceCatalogDTO req) {
        if (catalogRepo.existsByCategoryAndSubServiceNameIgnoreCase(
                req.getCategory(), req.getSubServiceName())) {
            throw new ConflictException(
                    "A catalog item with this name already exists in the category",
                    "CATALOG_DUPLICATE");
        }

        ServiceCatalog sc = ServiceCatalog.builder()
                .category(req.getCategory())
                .subServiceName(req.getSubServiceName())
                .defaultDuration(req.getDefaultDuration())
                .pricingUnit(req.getPricingUnit())
                .basePrice(req.getBasePrice())
                .isActive(true)
                .build();

        return mapper.toCatalogDTO(catalogRepo.save(sc));
    }

    /** Admin toggles a catalog item active/inactive (soft delete). */
    @Transactional
    public ServiceCatalogDTO toggleCatalogActive(Long catalogId) {
        ServiceCatalog sc = catalogRepo.findById(catalogId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceCatalog", catalogId));
        sc.setIsActive(!sc.getIsActive());
        return mapper.toCatalogDTO(catalogRepo.save(sc));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ══════════════════════════════════════════════════════════════════════════

    private Provider resolveActiveProvider(Long userId) {
        return providerRepo.findByUser_Id(userId)
                .filter(p -> Boolean.TRUE.equals(p.getIsActive()))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Active provider profile not found for user id: " + userId));
    }
}
