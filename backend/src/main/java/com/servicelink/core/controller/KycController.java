package com.servicelink.core.controller;

import com.servicelink.core.dto.request.KycSubmitRequestDTO;
import com.servicelink.core.dto.response.KycStatusResponseDTO;
import com.servicelink.core.dto.response.KycSubmitResponseDTO;
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

    @PostMapping(value = "/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<KycSubmitResponseDTO> submit(
            @RequestPart("data")                                    String dataJson,
            @RequestPart("citizenshipFront")                        MultipartFile citizenshipFront,
            @RequestPart("citizenshipBack")                         MultipartFile citizenshipBack,
            @RequestPart("photo")                                   MultipartFile photo,
            @RequestPart(value = "pan",              required = false) MultipartFile pan,
            @RequestPart(value = "professionalCerts", required = false) MultipartFile[] certs,
            @RequestHeader(value = "X-Provider-Token", required = false) String providerToken,
            Authentication auth
    ) throws Exception {

        ObjectMapper objectMapper = new ObjectMapper();
        KycSubmitRequestDTO dto =
            objectMapper.readValue(dataJson, KycSubmitRequestDTO.class);

        String applicantIdentifier = resolveIdentifier(providerToken, auth);

        return ResponseEntity.ok(
                kycService.submit(dto, citizenshipFront, citizenshipBack,
                        photo, pan, certs, applicantIdentifier)
        );
    }

    @GetMapping("/status")
    public ResponseEntity<KycStatusResponseDTO> status(
            @RequestHeader(value = "X-Provider-Token", required = false) String providerToken,
            Authentication auth) {

        String identifier = resolveIdentifier(providerToken, auth);
        return ResponseEntity.ok(kycService.getStatus(identifier));
    }

    /**
     * Resolves the applicant identifier from either a provider token or the
     * standard Spring Security authentication principal.
     */
    private String resolveIdentifier(String providerToken, Authentication auth) {
        if (providerToken != null && !providerToken.isBlank()) {
            // Validate and extract the subject (phone or email) from the provider token
            try {
                return jwtService.extractUsername(providerToken);
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid or expired provider token");
            }
        }
        if (auth != null && auth.isAuthenticated()) {
            return auth.getName();
        }
        throw new IllegalArgumentException(
                "Authentication required. Provide a provider token or log in.");
    }
}