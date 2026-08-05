package com.servicelink.core.controller;

import com.servicelink.core.dto.request.admin.KycReviewRequestDTO;
import com.servicelink.core.dto.request.admin.ScheduleVideoAuditRequestDTO;
import com.servicelink.core.dto.response.admin.ApiResponse;
import com.servicelink.core.dto.response.admin.KycAdminDetailDTO;
import com.servicelink.core.dto.response.admin.KycAdminListItemDTO;
import com.servicelink.core.model.common.KycSubmission;
import com.servicelink.core.service.KycService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@PreAuthorize("hasRole('ADMIN')")
@RestController
@RequestMapping("/api/admin/kyc")
@RequiredArgsConstructor
public class AdminKycController {

    private final KycService kycService;

    /** Handles GET /api/admin/kyc?status=PENDING&search=john */
    @GetMapping
    public ResponseEntity<List<KycAdminListItemDTO>> listAllKyc(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(kycService.listAll(status, search));
    }

    /** Handles GET /api/admin/kyc/pending */
    @GetMapping("/pending")
    public ResponseEntity<List<KycSubmission>> getPendingKyc() {
        return ResponseEntity.ok(kycService.getPendingSubmissions());
    }

    /** Handles GET /api/admin/kyc/{identifier} (Accepts numeric ID, reference string, or applicant identifier) */
    @GetMapping("/{identifier}")
    public ResponseEntity<KycAdminDetailDTO> getKycByIdentifier(@PathVariable String identifier) {
        return ResponseEntity.ok(kycService.getDetailByIdentifier(identifier));
    }

    @PutMapping("/{identifier}/approve")
    public ResponseEntity<ApiResponse> approveKyc(
            @PathVariable String identifier,
            @RequestBody(required = false) KycReviewRequestDTO request) {

        String reviewNotes = request != null ? request.getReviewNotes() : null;
        kycService.approveKyc(identifier, reviewNotes);
        return ResponseEntity.ok(new ApiResponse("KYC application approved successfully."));
    }

    @PutMapping("/{identifier}/reject")
    public ResponseEntity<ApiResponse> rejectKyc(
            @PathVariable String identifier,
            @Valid @RequestBody KycReviewRequestDTO request) {

        kycService.rejectKyc(identifier, request.getReviewNotes());
        return ResponseEntity.ok(new ApiResponse("KYC application rejected."));
    }

    @PostMapping("/{identifier}/schedule-video-audit")
    public ResponseEntity<ApiResponse> scheduleVideoAudit(
            @PathVariable String identifier,
            @Valid @RequestBody ScheduleVideoAuditRequestDTO request) {

        kycService.scheduleVideoAudit(identifier, request);
        return ResponseEntity.ok(new ApiResponse("Video audit scheduled and invite sent."));
    }
}