package com.servicelink.core.controller.provider;

import com.servicelink.core.dto.request.provider.*;
import com.servicelink.core.dto.request.provider.portfolio.CreatePortfolioDTO;
import com.servicelink.core.dto.request.provider.service.CreateCategoryDTO;
import com.servicelink.core.dto.request.provider.service.CreateCategoryWithServicesDTO;
import com.servicelink.core.dto.request.provider.service.CreateServiceCatalogDTO;
import com.servicelink.core.dto.request.provider.service.ProviderServiceSelectionDTO;
import com.servicelink.core.dto.request.provider.service.UpdateCategoryDTO;
import com.servicelink.core.dto.request.provider.service.UpdateServiceCatalogDTO;
import com.servicelink.core.dto.response.provider.*;
import com.servicelink.core.dto.response.provider.portfolio.PortfolioResponseDTO;
import com.servicelink.core.dto.response.provider.service.CategoryDTO;
import com.servicelink.core.dto.response.provider.service.ServiceCatalogDTO;
import com.servicelink.core.model.common.ServiceCategory;
import com.servicelink.core.model.user.User;
import com.servicelink.core.service.provider.ProviderProfileService;
import com.servicelink.core.dto.response.provider.onboarding.OnboardingStatusDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/providers")
@RequiredArgsConstructor
public class ProviderController {

    private final ProviderProfileService providerProfileService;

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC — no auth required
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<Page<ProviderProfileDTO>> getAllProviders(
            @RequestParam(required = false) ServiceCategory category,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(
                providerProfileService.getAllPublicProviders(category, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProviderProfileDTO> getPublicProfile(@PathVariable Long id) {
        return ResponseEntity.ok(providerProfileService.getPublicProfile(id));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<Page<ReviewDTO>> getProviderReviews(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(providerProfileService.getProviderReviews(
                id, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CATEGORIES — public browse + admin management
    // ─────────────────────────────────────────────────────────────────────────

    /** Public — active categories only, for user-facing browse/selection screens. */
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDTO>> getActiveCategories() {
        return ResponseEntity.ok(providerProfileService.getActiveCategories());
    }

    @GetMapping("/categories/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CategoryDTO>> getCategoriesForAdmin() {
        return ResponseEntity.ok(providerProfileService.getAllCategoriesForAdmin());
    }

    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryDTO> createCategory(@Valid @RequestBody CreateCategoryDTO req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(providerProfileService.createCategory(req));
    }

    /** Create a category and its initial sub-services in one request. */
    @PostMapping("/categories/with-services")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryDTO> createCategoryWithServices(
            @Valid @RequestBody CreateCategoryWithServicesDTO req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(providerProfileService.createCategoryWithServices(req));
    }

    @PatchMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryDTO> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryDTO req) {

        return ResponseEntity.ok(providerProfileService.updateCategory(id, req));
    }

    @PatchMapping("/categories/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryDTO> toggleCategory(@PathVariable Long id) {
        return ResponseEntity.ok(providerProfileService.toggleCategoryActive(id));
    }

    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        providerProfileService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/catalog/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCatalogItem(@PathVariable Long id) {
        providerProfileService.deleteCatalogItem(id);
        return ResponseEntity.noContent().build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SERVICE CATALOG — public browse + admin management
    // NOTE: category is now identified by categoryId (Long), not the old
    // ServiceCategory enum — update any existing frontend callers of GET
    // /catalog?category=XXX to use ?categoryId=1 instead.
    // ─────────────────────────────────────────────────────────────────────────
//
//    @GetMapping("/catalog")
//    public ResponseEntity<List<ServiceCatalogDTO>> getCatalog(
//            @RequestParam(required = false) Long categoryId) {
//
//        List<ServiceCatalogDTO> result = categoryId != null
//                ? providerProfileService.getCatalogByCategory(categoryId)
//                : providerProfileService.getAllActiveCatalog();
//
//        return ResponseEntity.ok(result);
//    }

//    @GetMapping("/catalog")
//    public ResponseEntity<List<ServiceCatalogDTO>> getCatalog(
//            @RequestParam(required = false) Long categoryId,
//            @RequestParam(required = false) String category) {
//
//        List<ServiceCatalogDTO> result;
//
//        if (categoryId != null) {
//            result = providerProfileService.getCatalogByCategory(categoryId);
//        } else if (category != null && !category.isBlank()) {
//            // Handle String category key passed by legacy / provider callers
//            result = providerProfileService.getCatalogByCategoryNameOrKey(category);
//        } else {
//            result = providerProfileService.getAllActiveCatalog();
//        }
//
//        return ResponseEntity.ok(result);
//    }

    @GetMapping("/catalog")
    public ResponseEntity<List<ServiceCatalogDTO>> getCatalog(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String category) {

        List<ServiceCatalogDTO> result = providerProfileService.getCatalogByCategoryOrName(categoryId, category);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/catalog/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ServiceCatalogDTO>> getCatalogForAdmin() {
        return ResponseEntity.ok(providerProfileService.getAllCatalogForAdmin());
    }

    @PostMapping("/catalog")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceCatalogDTO> createCatalogItem(
            @Valid @RequestBody CreateServiceCatalogDTO req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(providerProfileService.createCatalogItem(req));
    }

    @PatchMapping("/catalog/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceCatalogDTO> updateCatalogItem(
            @PathVariable Long id,
            @Valid @RequestBody UpdateServiceCatalogDTO req) {
        return ResponseEntity.ok(providerProfileService.updateCatalogItem(id, req));
    }

    @PatchMapping("/catalog/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceCatalogDTO> toggleCatalogItem(@PathVariable Long id) {
        return ResponseEntity.ok(providerProfileService.toggleCatalogActive(id));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PROVIDER — own profile management (ROLE_PROVIDER required)
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/me")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ProviderProfileDTO> getMyProfile(
            @AuthenticationPrincipal User user) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(providerProfileService.getMyProfile(user.getId()));
    }

    @PatchMapping("/me")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ProviderProfileDTO> updateMyProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateProviderProfileDTO req) {

        return ResponseEntity.ok(providerProfileService.updateMyProfile(user.getId(), req));
    }

    @PatchMapping("/me/online")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ProviderProfileDTO> setOnlineStatus(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateOnlineStatusDTO req) {

        return ResponseEntity.ok(
                providerProfileService.updateOnlineStatus(user.getId(), req.getIsOnline()));
    }

    @PostMapping(value = "/me/picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ProviderProfileDTO> uploadProfilePicture(
            @AuthenticationPrincipal User user,
            @RequestPart("file") MultipartFile file) throws Exception {

        return ResponseEntity.ok(providerProfileService.uploadProfilePicture(user.getId(), file));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PORTFOLIO — provider manages their own portfolio projects
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/me/portfolio")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<PortfolioResponseDTO>> getMyPortfolio(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(providerProfileService.getMyPortfolio(user.getId()));
    }

    @PostMapping(value = "/me/portfolio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<PortfolioResponseDTO> addPortfolioProject(
            @AuthenticationPrincipal User user,
            @Valid @ModelAttribute CreatePortfolioDTO request,
            @RequestParam(value = "photos", required = false) List<MultipartFile> photos,
            @RequestParam(value = "video", required = false) MultipartFile video)
            throws Exception {

        PortfolioResponseDTO saved = providerProfileService.addPortfolioProject(
                user.getId(), request, photos, video);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/me/portfolio/{projectId}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Void> deletePortfolioProject(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId) {

        providerProfileService.deletePortfolioProject(user.getId(), projectId);
        return ResponseEntity.noContent().build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REVIEWS — customer writes a review (ROLE_CUSTOMER)
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping("/reviews")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewDTO> createReview(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateReviewDTO req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(providerProfileService.createReview(user, req));
    }

    @GetMapping("/reviews/mine")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Page<ReviewDTO>> getMyReviews(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(providerProfileService.getMyReviewsAsCustomer(
                user.getId(), PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ONBOARDING — first-time setup flow (ROLE_PROVIDER)
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/me/onboarding-status")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<OnboardingStatusDTO> getOnboardingStatus(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(providerProfileService.getOnboardingStatus(user.getId()));
    }

    @PostMapping("/me/services/batch")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Void> saveMyServicesBatch(
            @AuthenticationPrincipal User user,
            @RequestBody List<ProviderServiceSelectionDTO> selections) {

        providerProfileService.saveMyServicesBatch(user.getId(), selections);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/me/complete-onboarding")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Void> completeOnboarding(
            @AuthenticationPrincipal User user) {

        providerProfileService.completeOnboarding(user.getId());
        return ResponseEntity.ok().build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REFERRALS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/providers/me/referrals
     * Referral code, progress toward the next free month, and referral history.
     */
    @GetMapping("/me/referrals")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ReferralSummaryDTO> getMyReferrals(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(providerProfileService.getMyReferralSummary(user.getId()));
    }
}