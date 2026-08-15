package com.servicelink.core.service.provider;

// com/servicelink/core/service/provider/ProviderProfileService.java
import com.servicelink.core.dto.request.provider.*;
import com.servicelink.core.dto.request.provider.portfolio.CreatePortfolioDTO;
import com.servicelink.core.dto.request.provider.service.CreateCategoryDTO;
import com.servicelink.core.dto.request.provider.service.CreateCategoryWithServicesDTO;
import com.servicelink.core.dto.request.provider.service.CreateProviderServiceDTO;
import com.servicelink.core.dto.request.provider.service.CreateServiceCatalogDTO;
import com.servicelink.core.dto.request.provider.service.ProviderServiceSelectionDTO;
import com.servicelink.core.dto.request.provider.service.SubServiceInputDTO;
import com.servicelink.core.dto.request.provider.service.UpdateCategoryDTO;
import com.servicelink.core.dto.request.provider.service.UpdateProviderServiceDTO;
import com.servicelink.core.dto.request.provider.service.UpdateServiceCatalogDTO;
import com.servicelink.core.dto.response.provider.*;
import com.servicelink.core.dto.response.provider.onboarding.OnboardingStatusDTO;
import com.servicelink.core.dto.response.provider.portfolio.PortfolioResponseDTO;
import com.servicelink.core.dto.response.provider.service.CategoryDTO;
import com.servicelink.core.dto.response.provider.service.ProviderServiceDTO;
import com.servicelink.core.dto.response.provider.service.ServiceCatalogDTO;
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
import com.servicelink.core.model.provider.service.Category;
import com.servicelink.core.model.provider.subscription.ProviderSubscription;
import com.servicelink.core.model.user.User;
import com.servicelink.core.repository.appointment.AppointmentRepository;
import com.servicelink.core.repository.provider.service.CategoryRepository;
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
    private static final int REFERRALS_PER_FREE_MONTH = 5;

    private final ProviderRepository         providerRepo;
    private final ProviderServiceRepository  providerServiceRepo;
    private final ServiceCatalogRepository   catalogRepo;
    private final CategoryRepository         categoryRepo;
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
     *
     * NOTE: still keyed off the ServiceCategory ENUM, not the new Category
     * entity — Provider.primaryService was not part of the category-management
     * migration. See class-level notes if/when that gets unified.
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
    // CATEGORIES  (Admin managed — new)
    // ══════════════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public List<CategoryDTO> getActiveCategories() {
        return categoryRepo.findByIsActiveTrueOrderByNameAsc()
                .stream()
                .map(c -> mapper.toCategoryDTO(c, (int) catalogRepo.countByCategory_Id(c.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategoriesForAdmin() {
        return categoryRepo.findAllByOrderByNameAsc()
                .stream()
                .map(c -> mapper.toCategoryDTO(c, (int) catalogRepo.countByCategory_Id(c.getId())))
                .toList();
    }

    /** Admin creates a bare category (no sub-services yet). */
    @Transactional
    public CategoryDTO createCategory(CreateCategoryDTO req) {
        if (categoryRepo.existsByNameIgnoreCase(req.getName())) {
            throw new ConflictException(
                    "A category with this name already exists", "CATEGORY_DUPLICATE");
        }

        Category category = Category.builder()
                .name(req.getName())
                .isActive(true)
                .build();

        Category saved = categoryRepo.save(category);
        log.info("Admin created category {} ({})", saved.getId(), saved.getName());
        return mapper.toCategoryDTO(saved, 0);
    }

    /**
     * Admin creates a category AND its initial set of sub-services in one
     * request — the "add new category with several services + base prices"
     * flow. Sub-services with a blank name are skipped rather than rejected,
     * so the frontend can send a spare trailing row from the form.
     */
    @Transactional
    public CategoryDTO createCategoryWithServices(CreateCategoryWithServicesDTO req) {
        if (categoryRepo.existsByNameIgnoreCase(req.getName())) {
            throw new ConflictException(
                    "A category with this name already exists", "CATEGORY_DUPLICATE");
        }

        Category category = categoryRepo.save(
                Category.builder().name(req.getName()).isActive(true).build());

        int created = 0;
        if (req.getSubServices() != null) {
            for (SubServiceInputDTO sub : req.getSubServices()) {
                if (sub.getSubServiceName() == null || sub.getSubServiceName().isBlank()) continue;

                ServiceCatalog sc = ServiceCatalog.builder()
                        .category(category)
                        .subServiceName(sub.getSubServiceName())
                        .defaultDuration(sub.getDefaultDuration())
                        .pricingUnit(sub.getPricingUnit())
                        .basePrice(sub.getBasePrice())
                        .isActive(true)
                        .build();
                catalogRepo.save(sc);
                created++;
            }
        }

        log.info("Admin created category {} with {} sub-service(s)", category.getName(), created);
        return mapper.toCategoryDTO(category, created);
    }

    // Add this method inside ProviderProfileService.java

//    @Transactional(readOnly = true)
//    public List<ServiceCatalogDTO> getCatalogByCategoryOrName(Long categoryId, String categoryName) {
//        if (categoryId != null) {
//            return getCatalogByCategory(categoryId);
//        }
//
//        if (categoryName != null && !categoryName.isBlank()) {
//            // Find category by matching name (e.g. ELECTRICIAN -> Electrical)
//            String search = mapFrontendKeyToCategoryName(categoryName);
//            return categoryRepo.findAllByOrderByNameAsc().stream()
//                    .filter(c -> c.getName().equalsIgnoreCase(search) ||
//                            c.getName().toUpperCase().contains(search.toUpperCase()))
//                    .findFirst()
//                    .map(c -> getCatalogByCategory(c.getId()))
//                    .orElse(List.of());
//        }
//
//        return getAllActiveCatalog();
//    }
//
//    private String mapFrontendKeyToCategoryName(String key) {
//        String upper = key.toUpperCase();
//        if (upper.equals("ELECTRICIAN")) return "Electrical";
//        if (upper.equals("PLUMBER")) return "Plumbing";
//        if (upper.equals("CARPENTER")) return "Carpentry";
//        if (upper.equals("PAINTER")) return "Painting";
//        return key;
//    }

    @Transactional(readOnly = true)
    public List<ServiceCatalogDTO> getCatalogByCategoryOrName(Long categoryId, String categoryName) {
        if (categoryId != null) {
            return getCatalogByCategory(categoryId);
        }

        if (categoryName != null && !categoryName.isBlank()) {
            String search = mapFrontendKeyToCategoryName(categoryName);

            return categoryRepo.findAllByOrderByNameAsc().stream()
                    .filter(c -> Boolean.TRUE.equals(c.getIsActive()))
                    .filter(c -> c.getName().equalsIgnoreCase(search) ||
                            c.getName().toUpperCase().contains(search.toUpperCase()))
                    .findFirst()
                    .map(c -> getCatalogByCategory(c.getId()))
                    .orElse(List.of()); // Crucial: returns empty list on mismatch to prevent leaking other categories
        }

        return getAllActiveCatalog();
    }

    private String mapFrontendKeyToCategoryName(String key) {
        if (key == null) return "";
        String upper = key.toUpperCase();
        if (upper.equals("ELECTRICIAN")) return "Electrical";
        if (upper.equals("PLUMBER")) return "Plumbing";
        if (upper.equals("CARPENTER")) return "Carpentry";
        if (upper.equals("PAINTER")) return "Painting";
        return key;
    }

    /** Admin renames a category. */
    @Transactional
    public CategoryDTO updateCategory(Long categoryId, UpdateCategoryDTO req) {
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", categoryId));

        if (req.getName() != null) {
            if (!req.getName().equalsIgnoreCase(category.getName())
                    && categoryRepo.existsByNameIgnoreCase(req.getName())) {
                throw new ConflictException(
                        "A category with this name already exists", "CATEGORY_DUPLICATE");
            }
            category.setName(req.getName());
        }

        Category saved = categoryRepo.save(category);
        return mapper.toCategoryDTO(saved, (int) catalogRepo.countByCategory_Id(categoryId));
    }

    /** Admin toggles a category active/inactive (soft delete). */
    @Transactional
    public CategoryDTO toggleCategoryActive(Long categoryId) {
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", categoryId));
        category.setIsActive(!category.getIsActive());
        Category saved = categoryRepo.save(category);
        return mapper.toCategoryDTO(saved, (int) catalogRepo.countByCategory_Id(categoryId));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // SERVICE CATALOG  (Admin / Postman managed)
    // ══════════════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public List<ServiceCatalogDTO> getCatalogByCategory(Long categoryId) {
        return catalogRepo
                .findByCategory_IdAndIsActiveTrueOrderBySubServiceNameAsc(categoryId)
                .stream()
                .map(mapper::toCatalogDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ServiceCatalogDTO> getAllActiveCatalog() {
        return catalogRepo
                .findByIsActiveTrueOrderByCategory_NameAscSubServiceNameAsc()
                .stream()
                .map(mapper::toCatalogDTO)
                .toList();
    }

    /**
     * Admin-facing catalog listing — includes inactive items so admins can
     * see and re-activate them (unlike getAllActiveCatalog(), which is for
     * the public/user-facing browse screens).
     */
    @Transactional(readOnly = true)
    public List<ServiceCatalogDTO> getAllCatalogForAdmin() {
        return catalogRepo
                .findAllByOrderByCategory_NameAscSubServiceNameAsc()
                .stream()
                .map(mapper::toCatalogDTO)
                .toList();
    }

    /** Admin adds a sub-service to an existing category. */
    @Transactional
    public ServiceCatalogDTO createCatalogItem(CreateServiceCatalogDTO req) {
        Category category = categoryRepo.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", req.getCategoryId()));

        if (catalogRepo.existsByCategory_IdAndSubServiceNameIgnoreCase(
                req.getCategoryId(), req.getSubServiceName())) {
            throw new ConflictException(
                    "A catalog item with this name already exists in the category",
                    "CATALOG_DUPLICATE");
        }

        ServiceCatalog sc = ServiceCatalog.builder()
                .category(category)
                .subServiceName(req.getSubServiceName())
                .defaultDuration(req.getDefaultDuration())
                .pricingUnit(req.getPricingUnit())
                .basePrice(req.getBasePrice())
                .isActive(true)
                .build();

        return mapper.toCatalogDTO(catalogRepo.save(sc));
    }

    /** Admin edits a catalog item's category/name/duration/pricing unit/base price. */
    @Transactional
    public ServiceCatalogDTO updateCatalogItem(Long catalogId, UpdateServiceCatalogDTO req) {
        ServiceCatalog sc = catalogRepo.findById(catalogId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceCatalog", catalogId));

        if (req.getCategoryId() != null) {
            Category category = categoryRepo.findById(req.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", req.getCategoryId()));
            sc.setCategory(category);
        }
        if (req.getSubServiceName() != null) sc.setSubServiceName(req.getSubServiceName());
        if (req.getDefaultDuration() != null) sc.setDefaultDuration(req.getDefaultDuration());
        if (req.getPricingUnit()    != null) sc.setPricingUnit(req.getPricingUnit());
        if (req.getBasePrice()      != null) sc.setBasePrice(req.getBasePrice());

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

    // ══════════════════════════════════════════════════════════════════════════
    // REFERRALS
    // ══════════════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public ReferralSummaryDTO getMyReferralSummary(Long userId) {
        Provider me = resolveActiveProvider(userId);

        // Column was added after some Provider rows already existed, so it
        // can be NULL in the DB for legacy rows — @Builder.Default only
        // applies to newly-built objects, not rows Hibernate hydrates.
        // Guard against NPE on unboxing to primitive int below.
        int freeMonthsEarned = me.getReferralFreeMonthsEarned() != null
                ? me.getReferralFreeMonthsEarned()
                : 0;

        List<Provider> referred = providerRepo.findByReferredById(me.getId());

        List<ReferralHistoryDTO> history = referred.stream()
                .map(p -> {
                    String kycStatus = p.getKycSubmission() != null
                            ? p.getKycSubmission().getStatus().name()
                            : "PENDING";
                    // TODO: replace with a real subscription/payment status check
                    // once that entity exists — placeholder below assumes any
                    // active provider has paid.
                    String paymentStatus = Boolean.TRUE.equals(p.getIsActive()) ? "PAID" : "UNPAID";
                    boolean counts = "APPROVED".equals(kycStatus) && "PAID".equals(paymentStatus);

                    return ReferralHistoryDTO.builder()
                            .name(p.getFullName())
                            .category(p.getPrimaryService() != null ? p.getPrimaryService().name() : "UNKNOWN")
                            .joinedDate(p.getMemberSince())
                            .kycStatus(kycStatus)
                            .paymentStatus(paymentStatus)
                            .counts(counts)
                            .build();
                })
                .toList();

        int countedTotal = (int) history.stream().filter(ReferralHistoryDTO::isCounts).count();
        int progress = countedTotal - (freeMonthsEarned * REFERRALS_PER_FREE_MONTH);

        return ReferralSummaryDTO.builder()
                .referralCode(me.getReferralCode())
                .progress(Math.max(0, progress))
                .total(REFERRALS_PER_FREE_MONTH)
                .freeMonthsEarned(freeMonthsEarned)
                .history(history)
                .build();
    }
}