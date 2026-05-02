package com.servicelink.core.controller;

import com.servicelink.core.dto.request.KycSubmitRequestDTO;
import com.servicelink.core.dto.response.KycStatusResponseDTO;
import com.servicelink.core.dto.response.KycSubmitResponseDTO;
import com.servicelink.core.service.KycService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/kyc")
@RequiredArgsConstructor
public class KycController {

    private final KycService kycService;

    /**
     * Accepts multipart/form-data — JSON fields + file uploads in one request.
     * The frontend sends FormData with the JSON blob + all files.
     */
    @PostMapping(value = "/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<KycSubmitResponseDTO> submit(
            @RequestPart("data")        KycSubmitRequestDTO dto,
            @RequestPart("citizenshipFront") MultipartFile citizenshipFront,
            @RequestPart("citizenshipBack")  MultipartFile citizenshipBack,
            @RequestPart("photo")            MultipartFile photo,
            @RequestPart(value = "pan",              required = false) MultipartFile pan,
            @RequestPart(value = "professionalCerts", required = false) MultipartFile[] certs,
            Authentication auth
    ) throws Exception {
        return ResponseEntity.ok(
                kycService.submit(dto, citizenshipFront, citizenshipBack,
                        photo, pan, certs, auth.getName())
        );
    }

    @GetMapping("/status")
    public ResponseEntity<KycStatusResponseDTO> status(Authentication auth) {
        return ResponseEntity.ok(kycService.getStatus(auth.getName()));
    }
}