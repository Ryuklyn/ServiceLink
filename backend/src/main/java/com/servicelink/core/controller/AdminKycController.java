package com.servicelink.core.controller;

import com.servicelink.core.service.KycService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@PreAuthorize("hasRole('ADMIN')")
@RestController
@RequestMapping("/api/admin/kyc")
@RequiredArgsConstructor
public class AdminKycController {

    private final KycService kycService;

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingKyc() {
        return ResponseEntity.ok(kycService.getPendingSubmissions());
    }

    @PutMapping("/{identifier}/approve")
    public ResponseEntity<?> approveKyc(
            @PathVariable String identifier,
            @RequestBody Map<String, String> body) {

        String reviewNotes = body.get("reviewNotes");
        kycService.approveKyc(identifier, reviewNotes);

        return ResponseEntity.ok(Map.of("message", "KYC application approved successfully."));
    }

    @PutMapping("/{identifier}/reject")
    public ResponseEntity<?> rejectKyc(
            @PathVariable String identifier,
            @RequestBody Map<String, String> body) {

        String reviewNotes = body.get("reviewNotes");
        kycService.rejectKyc(identifier, reviewNotes);

        return ResponseEntity.ok(Map.of("message", "KYC application rejected."));
    }
}
