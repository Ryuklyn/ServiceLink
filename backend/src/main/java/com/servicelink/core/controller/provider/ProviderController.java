package com.servicelink.core.controller.provider;

import com.servicelink.core.dto.request.provider.*;
import com.servicelink.core.dto.response.provider.*;
import com.servicelink.core.model.common.ServiceCategory;
import com.servicelink.core.model.user.User;
import com.servicelink.core.service.provider.ProviderProfileService;
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

    /**
     * GET /api/providers?category=ELECTRICIAN&page=0&size=20
     * Public paginated list of verified providers — used by the Explore page.
     */
    @GetMapping
    public ResponseEntity<Page<ProviderProfileDTO>> getAllProviders(
            @RequestParam(required = false) ServiceCategory category,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(
                providerProfileService.getAllPublicProviders(category, PageRequest.of(page, size)));
    }

    /**
     * GET /api/providers/{id}
     * Public profile for a provider (customers browsing, search results).
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProviderProfileDTO> getPublicProfile(@PathVariable Long id) {
        return ResponseEntity.ok(providerProfileService.getPublicProfile(id));
    }

    /**
     * GET /api/providers/{id}/reviews?page=0&size=10
     * Paginated reviews for a provider — shown on public profile page.
     */
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

    /**
     * GET /api/providers/catalog?category=ELECTRICIAN
     * All active sub-services for a category (service selection screen).
     */
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

    /**
     * GET /api/providers/me
     * Provider's full own profile including all services and portfolio.
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ProviderProfileDTO> getMyProfile(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(providerProfileService.getMyProfile(user.getId()));
    }

    /**
     * PATCH /api/providers/me
     * Update bio, location, service area, etc.
     */
    @PatchMapping("/me")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ProviderProfileDTO> updateMyProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateProviderProfileDTO req) {

        return ResponseEntity.ok(providerProfileService.updateMyProfile(user.getId(), req));
    }

    /**
     * PATCH /api/providers/me/online
     * Toggle online/offline visibility.
     */
    @PatchMapping("/me/online")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ProviderProfileDTO> setOnlineStatus(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateOnlineStatusDTO req) {

        return ResponseEntity.ok(
                providerProfileService.updateOnlineStatus(user.getId(), req.getIsOnline()));
    }

    /**
     * POST /api/providers/me/picture  (multipart/form-data)
     * Upload or replace profile picture.
     * Field name: "file"
     */
    @PostMapping(value = "/me/picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ProviderProfileDTO> uploadProfilePicture(
            @AuthenticationPrincipal User user,
            @RequestPart("file") MultipartFile file) throws Exception {

        return ResponseEntity.ok(providerProfileService.uploadProfilePicture(user.getId(), file));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PORTFOLIO — provider manages their own media
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/providers/me/portfolio
     */
    @GetMapping("/me/portfolio")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<PortfolioDTO>> getMyPortfolio(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(providerProfileService.getMyPortfolio(user.getId()));
    }

    /**
     * POST /api/providers/me/portfolio  (multipart/form-data)
     * Upload a new portfolio image or video.
     *
     * Form fields:
     *   file           — binary (required)
     *   mediaType      — "IMAGE" | "VIDEO" (required)
     *   caption        — optional text
     *   serviceCategory— optional e.g. "ELECTRICIAN"
     */
    @PostMapping(value = "/me/portfolio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<PortfolioDTO> addPortfolioItem(
            @AuthenticationPrincipal User user,
            @RequestPart("file")                     MultipartFile file,
            @RequestParam("mediaType")               String mediaType,
            @RequestParam(value = "caption",          required = false) String caption,
            @RequestParam(value = "serviceCategory",  required = false) String serviceCategory)
            throws Exception {

        PortfolioDTO saved = providerProfileService.addPortfolioItem(
                user.getId(), file, caption, serviceCategory, mediaType);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * PATCH /api/providers/me/portfolio/{itemId}/caption
     * Update just the caption of an existing portfolio item.
     */
    @PatchMapping("/me/portfolio/{itemId}/caption")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<PortfolioDTO> updateCaption(
            @AuthenticationPrincipal User user,
            @PathVariable Long itemId,
            @RequestParam String caption) {

        return ResponseEntity.ok(
                providerProfileService.updatePortfolioCaption(user.getId(), itemId, caption));
    }

    /**
     * DELETE /api/providers/me/portfolio/{itemId}
     */
    @DeleteMapping("/me/portfolio/{itemId}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Void> deletePortfolioItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long itemId) {

        providerProfileService.deletePortfolioItem(user.getId(), itemId);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/providers/me/portfolio/{itemId}/primary
     * Set this item as the primary (featured) portfolio item.
     */
    @PatchMapping("/me/portfolio/{itemId}/primary")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<PortfolioDTO> setPrimary(
            @AuthenticationPrincipal User user,
            @PathVariable Long itemId) {

        return ResponseEntity.ok(
                providerProfileService.setPrimaryPortfolioItem(user.getId(), itemId));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REVIEWS — customer writes a review (ROLE_CUSTOMER)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/providers/reviews
     * Customer submits a review after a completed appointment.
     */
    @PostMapping("/reviews")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewDTO> createReview(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateReviewDTO req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(providerProfileService.createReview(user, req));
    }

    /**
     * GET /api/providers/reviews/mine?page=0&size=10
     * Customer's own review history.
     */
    @GetMapping("/reviews/mine")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Page<ReviewDTO>> getMyReviews(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(providerProfileService.getMyReviewsAsCustomer(
                user.getId(), PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }
}