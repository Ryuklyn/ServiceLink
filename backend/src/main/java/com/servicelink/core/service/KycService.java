package com.servicelink.core.service;

import com.servicelink.core.dto.request.KycSubmitRequestDTO;
import com.servicelink.core.dto.response.KycStatusResponseDTO;
import com.servicelink.core.dto.response.KycSubmitResponseDTO;
import com.servicelink.core.mapper.KycMapper;
import com.servicelink.core.model.common.KycSubmission;
import com.servicelink.core.model.common.KycStatus; // ✅ Explicitly import your Enum type
import com.servicelink.core.model.user.User;
import com.servicelink.core.model.user.Role;
import com.servicelink.core.repository.KycRepository;
import com.servicelink.core.repository.UserRepository;
import com.servicelink.core.storage.SupabaseStorageService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class KycService {

    private static final Logger log = LoggerFactory.getLogger(KycService.class);

    private final KycRepository   kycRepository;
    private final UserRepository  userRepository;
    private final SupabaseStorageService storageService;
    private final KycMapper       kycMapper;
    private final EmailService    emailService;

    // ─── Submit ───────────────────────────────────────────────────────────────

//    @Transactional
//    public KycSubmitResponseDTO submit(
//            KycSubmitRequestDTO  dto,
//            MultipartFile        citizenshipFront,
//            MultipartFile        citizenshipBack,
//            MultipartFile        photo,
//            MultipartFile        pan,
//            MultipartFile[]      professionalCerts,
//            String               applicantIdentifier
//    ) throws Exception {
//
//        Optional<User> userOpt = userRepository.findByEmail(applicantIdentifier);
//
//        if (userOpt.isPresent() && kycRepository.existsByUser(userOpt.get())) {
//            throw new IllegalStateException("KYC already submitted for this account.");
//        }
//        if (kycRepository.existsByApplicantIdentifier(applicantIdentifier)) {
//            throw new IllegalStateException("A KYC application already exists for this contact.");
//        }
//
//        String frontPath = storageService.uploadFile(citizenshipFront, "kyc/citizenship-front");
//        String backPath  = storageService.uploadFile(citizenshipBack,  "kyc/citizenship-back");
//        String photoPath = storageService.uploadFile(photo,            "kyc/photo");
//
//        String panPath = (pan != null && !pan.isEmpty())
//                ? storageService.uploadFile(pan, "kyc/pan") : null;
//
//        String certPaths = buildCertPaths(professionalCerts);
//
//        KycSubmission submission = kycMapper.toEntity(
//                dto,
//                userOpt.orElse(null),
//                applicantIdentifier,
//                frontPath, backPath, photoPath, panPath, certPaths);
//
//        kycRepository.save(submission);
//        log.info("KYC submitted for applicant [{}] — ref: {}",
//                mask(applicantIdentifier), submission.getReferenceNumber());
//
//        String notifyEmail = dto.getEmail() != null ? dto.getEmail() : applicantIdentifier;
//        emailService.sendKycConfirmationEmail(notifyEmail, submission.getReferenceNumber());
//
//        return kycMapper.toSubmitResponse(submission, notifyEmail);
//    }

    @Transactional
    public KycSubmitResponseDTO submit(
            KycSubmitRequestDTO dto,
            String              applicantIdentifier
    ) {

        Optional<User> userOpt = userRepository.findByEmail(applicantIdentifier);

        if (userOpt.isPresent() && kycRepository.existsByUser(userOpt.get())) {
            throw new IllegalStateException("KYC already submitted for this account.");
        }
        if (kycRepository.existsByApplicantIdentifier(applicantIdentifier)) {
            throw new IllegalStateException("A KYC application already exists for this contact.");
        }

        // ✅ Storage upload calls hatayo — files pahile nai Supabase ma xan,
        // dto ma URL string aaisakeko cha
        KycSubmission submission = kycMapper.toEntity(dto, userOpt.orElse(null), applicantIdentifier);

        kycRepository.save(submission);
        log.info("KYC submitted for applicant [{}] — ref: {}",
                mask(applicantIdentifier), submission.getReferenceNumber());

        String notifyEmail = dto.getEmail() != null ? dto.getEmail() : applicantIdentifier;
        emailService.sendKycConfirmationEmail(notifyEmail, submission.getReferenceNumber());

        return kycMapper.toSubmitResponse(submission, notifyEmail);
    }
    // ─── Status ───────────────────────────────────────────────────────────────

    public KycStatusResponseDTO getStatus(String applicantIdentifier) {
        KycSubmission submission = kycRepository
                .findByApplicantIdentifier(applicantIdentifier)
                .orElseGet(() -> {
                    return userRepository.findByEmail(applicantIdentifier)
                            .flatMap(kycRepository::findByUser)
                            .orElseThrow(() -> new RuntimeException("No KYC submission found"));
                });
        return kycMapper.toStatusResponse(submission);
    }

    // ─── Phase 4: Admin Infrastructure ────────────────────────────────────────

    /**
     * Fetches all provider onboarding records currently awaiting administrative verification.
     */
    public List<KycSubmission> getPendingSubmissions() {
        // ✅ FIXED: Pass Enum token instead of raw String
        return kycRepository.findByStatus(KycStatus.PENDING);
    }

    /**
     * Approves an application, elevates the target user account profile to PROVIDER,
     * and tracks auditing notes.
     */
    @Transactional
    public void approveKyc(String applicantIdentifier, String reviewNotes) {
        KycSubmission submission = kycRepository
                .findByApplicantIdentifier(applicantIdentifier)
                .orElseThrow(() -> new RuntimeException("KYC registration record not found"));

        // ✅ FIXED: Using type-safe Enum assignment instead of a raw String
        submission.setStatus(KycStatus.APPROVED);
        submission.setReviewedAt(Instant.now());

        if (reviewNotes != null) {
            submission.setReviewNotes(reviewNotes);
        }
        kycRepository.save(submission);

        // Elevate user system role permissions upon onboarding validation success
        Optional<User> userOpt = userRepository.findByEmail(applicantIdentifier);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setRole(Role.PROVIDER);
            userRepository.save(user);
            log.info("User [{}] role elevated to PROVIDER following KYC approval.", mask(applicantIdentifier));
        }

        log.info("KYC Approved for identifier [{}]", mask(applicantIdentifier));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private String buildCertPaths(MultipartFile[] certs) throws Exception {
        if (certs == null || certs.length == 0) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (MultipartFile cert : certs) {
            if (!cert.isEmpty()) {
                sb.append("\"")
                        .append(storageService.uploadFile(cert, "kyc/certs"))
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