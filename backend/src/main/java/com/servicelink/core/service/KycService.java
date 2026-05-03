package com.servicelink.core.service;

import com.servicelink.core.dto.request.KycSubmitRequestDTO;
import com.servicelink.core.dto.response.KycStatusResponseDTO;
import com.servicelink.core.dto.response.KycSubmitResponseDTO;
import com.servicelink.core.mapper.KycMapper;
import com.servicelink.core.model.KycSubmission;
import com.servicelink.core.model.User;
import com.servicelink.core.repository.KycRepository;
import com.servicelink.core.repository.UserRepository;
import com.servicelink.core.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class KycService {

    private static final Logger log = LoggerFactory.getLogger(KycService.class);

    private final KycRepository   kycRepository;
    private final UserRepository  userRepository;
    private final StorageService  storageService;
    private final KycMapper       kycMapper;
    private final EmailService    emailService;

    // ─── Submit ───────────────────────────────────────────────────────────────

    @Transactional
    public KycSubmitResponseDTO submit(
            KycSubmitRequestDTO  dto,
            MultipartFile        citizenshipFront,
            MultipartFile        citizenshipBack,
            MultipartFile        photo,
            MultipartFile        pan,
            MultipartFile[]      professionalCerts,
            String               applicantIdentifier   // phone (E.164) OR email
    ) throws IOException {

        // Resolve optional User (may not exist for new provider applicants)
        Optional<User> userOpt = userRepository.findByEmail(applicantIdentifier);

        // Duplicate check — keyed on phone OR on user
        if (userOpt.isPresent() && kycRepository.existsByUser(userOpt.get())) {
            throw new IllegalStateException("KYC already submitted for this account.");
        }
        if (kycRepository.existsByApplicantIdentifier(applicantIdentifier)) {
            throw new IllegalStateException("A KYC application already exists for this contact.");
        }

        // Upload mandatory documents
        String frontPath = storageService.upload(citizenshipFront, "kyc/citizenship-front");
        String backPath  = storageService.upload(citizenshipBack,  "kyc/citizenship-back");
        String photoPath = storageService.upload(photo,            "kyc/photo");

        // Upload optional PAN
        String panPath = (pan != null && !pan.isEmpty())
                ? storageService.upload(pan, "kyc/pan") : null;

        // Upload optional professional certs
        String certPaths = buildCertPaths(professionalCerts);

        // Build entity — user may be null for new applicants
        KycSubmission submission = kycMapper.toEntity(
                dto,
                userOpt.orElse(null),
                applicantIdentifier,
                frontPath, backPath, photoPath, panPath, certPaths);

        kycRepository.save(submission);
        log.info("KYC submitted for applicant [{}] — ref: {}",
                mask(applicantIdentifier), submission.getReferenceNumber());

        // Send confirmation email asynchronously (non-critical)
        String notifyEmail = dto.getEmail() != null ? dto.getEmail() : applicantIdentifier;
        emailService.sendKycConfirmationEmail(notifyEmail, submission.getReferenceNumber());

        return kycMapper.toSubmitResponse(submission, notifyEmail);
    }

    // ─── Status ───────────────────────────────────────────────────────────────

    public KycStatusResponseDTO getStatus(String applicantIdentifier) {
        KycSubmission submission = kycRepository
                .findByApplicantIdentifier(applicantIdentifier)
                .orElseGet(() -> {
                    // Fallback: try by User (for email-authenticated users)
                    return userRepository.findByEmail(applicantIdentifier)
                            .flatMap(kycRepository::findByUser)
                            .orElseThrow(() -> new RuntimeException("No KYC submission found"));
                });
        return kycMapper.toStatusResponse(submission);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private String buildCertPaths(MultipartFile[] certs) throws IOException {
        if (certs == null || certs.length == 0) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (MultipartFile cert : certs) {
            if (!cert.isEmpty()) {
                sb.append("\"")
                  .append(storageService.upload(cert, "kyc/certs"))
                  .append("\",");
            }
        }
        if (sb.length() > 1) sb.deleteCharAt(sb.length() - 1);
        sb.append("]");
        return sb.toString();
    }

    private static String mask(String s) {
        if (s == null || s.length() <= 4) return "***";
        return s.substring(0, 4) + "***";
    }
}