package com.servicelink.core.service.provider;

// com/servicelink/core/service/provider/ProviderProfileService.java
import com.servicelink.core.dto.request.provider.*;
import com.servicelink.core.dto.request.provider.portfolio.CreatePortfolioDTO;
import com.servicelink.core.dto.response.provider.*;
import com.servicelink.core.dto.response.provider.onboarding.OnboardingStatusDTO;
import com.servicelink.core.dto.response.provider.portfolio.PortfolioResponseDTO;
import com.servicelink.core.exception.BusinessException;
import com.servicelink.core.exception.ConflictException;
import com.servicelink.core.exception.ResourceNotFoundException;
import com.servicelink.core.mapper.provider.ProviderMapper;
import com.servicelink.core.mapper.provider.portfolio.PortfolioMapper;
import com.servicelink.core.model.appointment.Appointment;
import com.servicelink.core.model.appointment.AppointmentStatus;
import com.servicelink.core.model.common.ServiceCategory;
import com.servicelink.core.model.provider.*;
import com.servicelink.core.model.provider.portfolio.Portfolio;
import com.servicelink.core.model.provider.portfolio.PortfolioMedia;
import com.servicelink.core.model.provider.review.Review;
import com.servicelink.core.model.provider.subscription.ProviderSubscription;
import com.servicelink.core.model.user.User;
import com.servicelink.core.repository.appointment.AppointmentRepository;
import com.servicelink.core.repository.provider.ProviderRepository;
import com.servicelink.core.repository.appointment.ProviderServiceRepository;
import com.servicelink.core.repository.appointment.ServiceCatalogRepository;
import com.servicelink.core.repository.appointment.ReviewRepository;
import com.servicelink.core.repository.provider.portfolio.PortfolioRepository;
import com.servicelink.core.service.provider.subscription.ProviderSubscriptionService;
import com.servicelink.core.storage.SupabaseStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProviderProfileService {

    private static final int MAX_PORTFOLIO_PROJECTS = 10;
    private static final int MAX_PORTFOLIO_PHOTOS = 5;

    private final ProviderRepository         providerRepo;
    private final ProviderServiceRepository  providerServiceRepo;
    private final ServiceCatalogRepository   catalogRepo;
    private final ReviewRepository           reviewRepo;
    private final PortfolioRepository        portfolioRepo;
    private final PortfolioMapper            portfolioMapper;
    private final AppointmentRepository      appointmentRepo;
    private final SupabaseStorageService     storageService;
    private final ProviderMapper             mapper;
    private final ProviderSubscriptionService subscriptionService;

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

        ProviderProfileDTO dto = mapper.toProfileDTO(provider, recent);
        dto.setServices(dto.getServices().stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsAvailable()))
                .toList());
        return dto;
    }

    /**
     * Public paginated list of verified + active providers, for the Explore page.
     * Optionally filtered by category. Sorted by rating desc (baked into repo query).
     *
     * NOTE: uses an empty review list per provider to avoid N+1 queries across
     * the whole page — full recent reviews are only loaded on the single-provider
     * profile page via getPublicProfile().
     */
    @Transactional(readOnly = true)
    public Page<ProviderProfileDTO> getAllPublicProviders(ServiceCategory category, Pageable pageable) {
        Page<Provider> providers = (category != null)
                ? providerRepo.findByPrimaryServiceAndIsVerifiedTrueAndIsActiveTrueAndHasCompletedOnboardingTrueOrderByAverageRatingDesc(category, pageable)
                : providerRepo.findByIsVerifiedTrueAndIsActiveTrueAndHasCompletedOnboardingTrueOrderByAverageRatingDesc(pageable);

        return providers.map(p -> {
            ProviderProfileDTO dto = mapper.toProfileDTO(p, List.of());
            dto.setServices(dto.getServices().stream()
                    .filter(s -> Boolean.TRUE.equals(s.getIsAvailable()))
                    .toList());
            return dto;
        });
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
    //
    // A Portfolio row is a *project* (title, description, service category,
    // completion date, location) that owns a list of PortfolioMedia items
    // (up to 5 photos + 1 video). This coexists with the standalone
    // PortfolioController -> PortfolioService path — both go through the
    // same PortfolioRepository/PortfolioMapper, so keep the limits below
    // (MAX_PORTFOLIO_PROJECTS / MAX_PORTFOLIO_PHOTOS) in sync with
    // PortfolioService's MAX_PROJECTS / MAX_PHOTOS if either changes.
    // ══════════════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public List<PortfolioResponseDTO> getMyPortfolio(Long userId) {
        Provider provider = resolveActiveProvider(userId);
        return portfolioRepo
                .findByProviderIdOrderByCreatedAtDesc(provider.getId())
                .stream()
                .map(portfolioMapper::toResponse)
                .toList();
    }

    /**
     * Create a new portfolio project: text fields + up to 5 photos + 1 optional video.
     * Each file is uploaded to Supabase individually; the returned URL becomes a
     * PortfolioMedia row attached to the new project.
     */
    @Transactional
    public PortfolioResponseDTO addPortfolioProject(Long userId,
                                                    CreatePortfolioDTO request,
                                                    List<MultipartFile> photos,
                                                    MultipartFile video) throws Exception {
        Provider provider = resolveActiveProvider(userId);

        long existingCount = portfolioRepo.countByProviderId(provider.getId());
        if (existingCount >= MAX_PORTFOLIO_PROJECTS) {
            throw new BusinessException(
                    "Maximum of " + MAX_PORTFOLIO_PROJECTS + " portfolio projects allowed.",
                    "PORTFOLIO_LIMIT_REACHED");
        }

        if (photos != null && photos.size() > MAX_PORTFOLIO_PHOTOS) {
            throw new BusinessException(
                    "Maximum of " + MAX_PORTFOLIO_PHOTOS + " photos allowed per project.",
                    "PORTFOLIO_PHOTO_LIMIT");
        }

        Portfolio project = Portfolio.builder()
                .provider(provider)
                .title(request.getTitle())
                .serviceCategory(request.getServiceType())
                .description(request.getDescription())
                .completionDate(parseCompletionDate(request.getCompletionDate()))
                .location(request.getLocation())
                .build();

        if (photos != null) {
            int order = 0;
            for (MultipartFile photo : photos) {
                if (photo == null || photo.isEmpty()) continue;
                String url = storageService.uploadFile(photo, "portfolio/" + provider.getId() + "/photos");
                PortfolioMedia media = PortfolioMedia.builder()
                        .mediaUrl(url)
                        .mediaType(PortfolioMedia.MediaType.IMAGE)
                        .displayOrder(order++)
                        .build();
                project.addMedia(media);
            }
        }

        if (video != null && !video.isEmpty()) {
            String url = storageService.uploadFile(video, "portfolio/" + provider.getId() + "/videos");
            PortfolioMedia media = PortfolioMedia.builder()
                    .mediaUrl(url)
                    .mediaType(PortfolioMedia.MediaType.VIDEO)
                    .displayOrder(0)
                    .build();
            project.addMedia(media);
        }

        Portfolio saved = portfolioRepo.save(project);
        log.info("Provider {} added portfolio project {}", provider.getId(), saved.getId());

        return portfolioMapper.toResponse(saved);
    }

    @Transactional
    public void deletePortfolioProject(Long userId, Long portfolioId) {
        Provider provider = resolveActiveProvider(userId);

        if (!portfolioRepo.existsByIdAndProviderId(portfolioId, provider.getId())) {
            throw new ResourceNotFoundException("Portfolio project", portfolioId);
        }

        portfolioRepo.deleteById(portfolioId);
        log.info("Provider {} deleted portfolio project {}", provider.getId(), portfolioId);
        // Note: this removes the DB rows (Portfolio + its PortfolioMedia, via
        // cascade + orphanRemoval) but does NOT delete the underlying files
        // from Supabase storage. Add a deleteFile(objectPath) method to
        // SupabaseStorageService and call it per media item here if needed.
    }

    // caption-editing and "set primary" are intentionally not carried over —
    // Portfolio has no `caption` or `isPrimary` field in the current schema.
    // If you want either back: isPrimary as a project-level flag on Portfolio,
    // vs. a cover-photo flag on PortfolioMedia — say which and I'll add the
    // field + these methods to both this service and PortfolioService.

    private LocalDate parseCompletionDate(String monthValue) {
        if (monthValue == null || monthValue.isBlank()) return null;
        // <input type="month"> submits "yyyy-MM" — pad to a full ISO date
        return LocalDate.parse(monthValue + "-01", DateTimeFormatter.ISO_DATE);
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

    @Transactional
    public OnboardingStatusDTO getOnboardingStatus(Long userId) {
        Provider provider = resolveActiveProvider(userId);

        ProviderSubscription subscription = subscriptionService.issueTrialIfEligible(provider);

        return OnboardingStatusDTO.builder()
                .hasCompletedOnboarding(Boolean.TRUE.equals(provider.getHasCompletedOnboarding()))
                .hasProfilePicture(provider.getProfilePictureUrl() != null)
                .hasBio(provider.getBio() != null && !provider.getBio().isBlank())
                .hasServiceArea(provider.getBaseDistrict() != null)
                .hasAtLeastOneService(!provider.getServices().isEmpty())
                .subscriptionDaysRemaining(subscription.getDaysRemaining())
                .subscriptionPlanType(subscription.getPlanType())
                .subscriptionActive(subscription.isCurrentlyActive())
                .referralCode(provider.getReferralCode())
                .build();
    }

    /** Called from the onboarding wizard's final step. */
    @Transactional
    public void completeOnboarding(Long userId) {
        Provider provider = resolveActiveProvider(userId);

        if (provider.getServices().isEmpty()) {
            throw new BusinessException(
                    "Add at least one service before completing onboarding", "ONBOARDING_INCOMPLETE");
        }

        provider.setHasCompletedOnboarding(true);
        providerRepo.save(provider);
        log.info("Provider {} completed onboarding", provider.getId());
    }

    @Transactional
    public void saveMyServicesBatch(Long userId, List<ProviderServiceSelectionDTO> selections) {
        Provider provider = resolveActiveProvider(userId);

        for (ProviderServiceSelectionDTO sel : selections) {

            if (sel.getCustomPrice() == null) {
                throw new BusinessException(
                        "customPrice is required for catalog item " + sel.getCatalogId(),
                        "MISSING_PRICE");
            }

            ServiceCatalog catalog = catalogRepo.findByIdAndIsActiveTrue(sel.getCatalogId())
                    .orElseThrow(() -> new ResourceNotFoundException("ServiceCatalog", sel.getCatalogId()));

            ProviderService ps = providerServiceRepo
                    .findByProviderIdAndCatalogId(provider.getId(), sel.getCatalogId())
                    .orElseGet(() -> ProviderService.builder()
                            .provider(provider)
                            .catalogItem(catalog)
                            .build());

            ps.setIsAvailable(sel.isAvailable());
            ps.setCustomPrice(sel.getCustomPrice());
            providerServiceRepo.save(ps);
        }

        log.info("Provider {} saved {} service selection(s) via onboarding batch",
                provider.getId(), selections.size());
    }
}