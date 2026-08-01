package com.servicelink.core.controller.provider;

import com.servicelink.core.dto.request.provider.*;
import com.servicelink.core.dto.request.provider.portfolio.CreatePortfolioDTO;
import com.servicelink.core.dto.response.provider.*;
import com.servicelink.core.dto.response.provider.portfolio.PortfolioResponseDTO;
import com.servicelink.core.model.common.ServiceCategory;
import com.servicelink.core.model.user.User;
import com.servicelink.core.service.provider.ProviderProfileService;
import com.servicelink.core.dto.request.provider.ProviderServiceSelectionDTO;
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
    // SERVICE CATALOG — public browse
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/catalog")
    public ResponseEntity<List<ServiceCatalogDTO>> getCatalog(
            @RequestParam(required = false) ServiceCategory category) {

        List<ServiceCatalogDTO> result = category != null
                ? providerProfileService.getCatalogByCategory(category)
                : providerProfileService.getAllActiveCatalog();

        return ResponseEntity.ok(result);
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