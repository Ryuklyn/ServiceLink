package com.servicelink.core.controller;

import com.servicelink.core.dto.request.KycSubmitRequestDTO;
import com.servicelink.core.dto.response.KycStatusResponseDTO;
import com.servicelink.core.dto.response.KycSubmitResponseDTO;
import com.servicelink.core.dto.response.kyc.PublicKycStatusResponseDTO;
import com.servicelink.core.security.JwtService;
import com.servicelink.core.service.KycService;
import lombok.RequiredArgsConstructor;
import tools.jackson.databind.ObjectMapper;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * KYC submission accepts two auth modes:
 *
 * 1. Standard JWT (existing users re-submitting or updating)
 *    → uses Authentication principal (email as subject)
 *
 * 2. Provider token (new applicants — issued after OTP verify)
 *    → passed as X-Provider-Token header; subject = phone/email used at OTP
 *    → KYC record is linked to that identifier instead of a User entity
 */
@RestController
@RequestMapping("/api/kyc")
@RequiredArgsConstructor
public class KycController {

    private final KycService kycService;
    private final JwtService jwtService;


    @PostMapping(value = "/submit", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<KycSubmitResponseDTO> submit(
            @RequestBody KycSubmitRequestDTO dto,
            @RequestHeader(value = "X-Provider-Token", required = false) String providerToken,
            Authentication auth
    ) throws Exception {

        // Backend-side mandatory URL check (frontend validation lai matra
        // bharosa garna mildaina)
        if (dto.getCitizenshipFrontUrl() == null
                || dto.getCitizenshipBackUrl() == null
                || dto.getPhotoUrl() == null) {
            throw new IllegalArgumentException("Missing required KYC document URLs");
        }

        String applicantIdentifier = resolveIdentifier(providerToken, auth, dto.getApplicantIdentifier());

        return ResponseEntity.ok(kycService.submit(dto, applicantIdentifier));
    }

        @GetMapping("/status")
        public ResponseEntity<KycStatusResponseDTO> status(
                @RequestHeader(value = "X-Provider-Token", required = false) String providerToken,
                Authentication auth) {

            String identifier = resolveIdentifier(providerToken, auth, null); // status still requires auth
            return ResponseEntity.ok(kycService.getStatus(identifier));
        }

    /**
     * Public, token-independent status lookup by reference number.
     * Used by the post-submission confirmation page (DoneStep) and the
     * receipt view, which must remain accessible even after the applicant's
     * short-lived provider token (15 min) has expired.
     *
     * Intentionally does NOT require X-Provider-Token or Authentication —
     * the reference number itself (random, non-sequential) is the lookup key.
     */
    @GetMapping("/status/by-reference")
    public ResponseEntity<PublicKycStatusResponseDTO> statusByReference(
            @RequestParam("ref") String referenceNumber) {
        return ResponseEntity.ok(kycService.getStatusByReferenceNumber(referenceNumber));
    }

    /**
     * Resolves the applicant identifier from either a provider token or the
     * standard Spring Security authentication principal.
     */

    private String resolveIdentifier(String providerToken, Authentication auth, String dtoIdentifier) {
        // 1. Provider token (login flow)
        if (providerToken != null && !providerToken.isBlank()) {
            try {
                return jwtService.extractUsername(providerToken);
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid or expired provider token");
            }
        }

        // 2. Authenticated session (existing user re-submitting)
        if (auth != null && auth.isAuthenticated()) {
            return auth.getName();
        }

        // 3. New provider registration — identifier comes directly from the form
        if (dtoIdentifier != null && !dtoIdentifier.isBlank()) {
            return dtoIdentifier;
        }

        throw new IllegalArgumentException(
                "Applicant identifier is required. Provide a phone or email.");
    }
}
