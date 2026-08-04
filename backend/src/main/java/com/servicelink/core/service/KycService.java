package com.servicelink.core.service;

import com.servicelink.core.dto.request.KycSubmitRequestDTO;
import com.servicelink.core.dto.request.admin.ScheduleVideoAuditRequestDTO;
import com.servicelink.core.dto.response.KycStatusResponseDTO;
import com.servicelink.core.dto.response.KycSubmitResponseDTO;
import com.servicelink.core.dto.response.admin.KycAdminDetailDTO;
import com.servicelink.core.dto.response.admin.KycAdminListItemDTO;
import com.servicelink.core.dto.response.kyc.PublicKycStatusResponseDTO;
import com.servicelink.core.mapper.KycMapper;
import com.servicelink.core.mapper.admin.KycAdminMapper;
import com.servicelink.core.model.auth.AuthProvider;
import com.servicelink.core.model.common.KycSubmission;
import com.servicelink.core.model.common.KycStatus;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.user.User;
import com.servicelink.core.model.user.Role;
import com.servicelink.core.repository.KycRepository;
import com.servicelink.core.repository.provider.ProviderRepository;
import com.servicelink.core.repository.UserRepository;
import com.servicelink.core.storage.SupabaseStorageService;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.LinkedHashSet;
import java.util.Set;
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

    private final KycRepository      kycRepository;
    private final UserRepository     userRepository;
    private final ProviderRepository providerRepository;
    private final SupabaseStorageService storageService;
    private final KycMapper       kycMapper;
    private final KycAdminMapper  kycAdminMapper; // NEW — maps KycSubmission -> admin list/detail DTOs
    private final EmailService    emailService;

    // ─── Submit ───────────────────────────────────────────────────────────────
    // (unchanged)

    @Transactional
    public KycSubmitResponseDTO submit(
            KycSubmitRequestDTO dto,
            String applicantIdentifier
    ) {

        Optional<User> userOpt = userRepository.findByEmail(applicantIdentifier);

        if (userOpt.isPresent() && kycRepository.existsByUser(userOpt.get())) {
            throw new IllegalStateException("KYC already submitted for this account.");
        }

        if (kycRepository.existsByApplicantIdentifier(applicantIdentifier)) {
            throw new IllegalStateException("A KYC application already exists for this contact.");
        }

        KycSubmission submission =
                kycMapper.toEntity(dto, userOpt.orElse(null), applicantIdentifier);

        log.info("Generated reference = {}", submission.getReferenceNumber());

        kycRepository.save(submission);

        log.info("Saved submission id = {}", submission.getId());
        log.info("Saved reference = {}", submission.getReferenceNumber());

        log.info(
                "KYC submitted for applicant [{}] — ref: {}",
                mask(applicantIdentifier),
                submission.getReferenceNumber()
        );

        String notifyEmail =
                dto.getEmail() != null ? dto.getEmail() : applicantIdentifier;

        emailService.sendKycConfirmationEmail(
                notifyEmail,
                submission.getReferenceNumber()
        );

        KycSubmitResponseDTO response =
                kycMapper.toSubmitResponse(submission, notifyEmail);

        log.info("Returned reference = {}", response.getReferenceNumber());

        return response;
    }

    // ─── Phase 4: Admin Infrastructure ────────────────────────────────────────

    public List<KycSubmission> getPendingSubmissions() {
        return kycRepository.findByStatus(KycStatus.PENDING);
    }

    /**
     * Admin desk list — all submissions, optionally filtered by status and/or
     * searched by name/email/reference. Used by the KYC management table.
     */
    public List<KycAdminListItemDTO> listAll(String status, String search) {
        List<KycSubmission> all = (status == null || status.isBlank() || status.equalsIgnoreCase("all"))
                ? kycRepository.findAll()
                : kycRepository.findByStatus(KycStatus.valueOf(status.toUpperCase()));

        return all.stream()
                .filter(s -> search == null || search.isBlank()
                        || s.getFullName().toLowerCase().contains(search.toLowerCase())
                        || s.getEmail().toLowerCase().contains(search.toLowerCase())
                        || s.getReferenceNumber().toLowerCase().contains(search.toLowerCase()))
                .map(kycAdminMapper::toListItem)
                .toList();
    }

    /** Admin detail modal — full submission by applicantIdentifier. */

    public KycAdminDetailDTO getDetailByIdentifier(String applicantIdentifier) {
        KycSubmission submission = kycRepository.findByApplicantIdentifier(applicantIdentifier)
                .orElseThrow(() -> new IllegalArgumentException(
                        "KYC submission not found for identifier: " + applicantIdentifier));
        return kycAdminMapper.toDetail(submission);
    }

    /**
     * Approves an application, provisions (or elevates) the applicant's User account
     * to PROVIDER, and creates the corresponding Provider row. This is the single
     * place approval should happen through — a bare SQL UPDATE on kyc_submissions.status
     * will NOT create the Provider row or promote the user, leaving the system in an
     * inconsistent state (status says approved, but nothing else reflects it).
     */
    @Transactional
    public void approveKyc(String applicantIdentifier, String reviewNotes) {
        KycSubmission submission = kycRepository
                .findByApplicantIdentifier(applicantIdentifier)
                .orElseThrow(() -> new RuntimeException("KYC registration record not found"));

        if (submission.getStatus() == KycStatus.APPROVED) {
            log.info("KYC for [{}] is already APPROVED — skipping re-approval to avoid duplicate Provider rows.",
                    mask(applicantIdentifier));
            return;
        }

        submission.setStatus(KycStatus.APPROVED);
        submission.setReviewedAt(Instant.now());

        if (reviewNotes != null) {
            submission.setReviewNotes(reviewNotes);
        }
        kycRepository.save(submission);

        User user = resolveOrCreateProviderUser(submission, applicantIdentifier);

        Provider provider = Provider.builder()
                .user(user)
                .build();
        provider.syncFromKyc(submission);

        provider.setBaseDistrict(submission.getPrimaryDistrict());
        provider.setCoveredDistricts(submission.getSecondaryDistricts());
        provider.setProfilePictureUrl(submission.getProfilePhotoUrl());
        provider.setTravelRadiusKm(parseTravelRadiusKm(submission.getTravelRadius()));
        provider.setCertifiedCategories(buildCertifiedCategories(submission));

        provider.setIsVerified(true);
        provider.setIsActive(true);

        providerRepository.save(provider);

        log.info("KYC Approved for identifier [{}]", mask(applicantIdentifier));
        log.info("Approving applicant = {}", mask(applicantIdentifier));
        log.info("Submission id = {}", submission.getId());
        log.info("Reference = {}", submission.getReferenceNumber());
        log.info("Provisioned Provider id = {} (userId = {})", provider.getId(), user.getId());

        emailService.sendKycApprovalEmail(submission.getEmail(), submission.getFullName(), submission.getReferenceNumber());
    }

    private User resolveOrCreateProviderUser(KycSubmission submission, String applicantIdentifier) {
        User user = submission.getUser();

        if (user == null && submission.getEmail() != null) {
            user = userRepository.findByEmail(submission.getEmail()).orElse(null);
        }

        if (user != null) {
            user.setRole(Role.PROVIDER);
            userRepository.save(user);
            log.info("User [{}] role elevated to PROVIDER following KYC approval.", mask(applicantIdentifier));
            return user;
        }

        String email = submission.getEmail();
        if (email == null || email.isBlank()) {
            throw new IllegalStateException(
                    "Cannot create a User account for KYC reference " + submission.getReferenceNumber() +
                            " — no email on file (submission.email is blank). User.email is NOT NULL, " +
                            "so this applicant needs manual account setup before approval can complete."
            );
        }

        User newUser = User.builder()
                .fullName(submission.getFullName())
                .email(email)
                .provider(AuthProvider.LOCAL)
                .role(Role.PROVIDER)
                .verified(true)
                .password(null)
                .build();

        User saved = userRepository.save(newUser);
        log.info("Created new PROVIDER account for [{}] following KYC approval.", mask(applicantIdentifier));
        return saved;
    }

    private Integer parseTravelRadiusKm(String travelRadius) {
        if (travelRadius == null || travelRadius.isBlank()) return null;
        try {
            return Integer.parseInt(travelRadius.replaceAll("[^0-9]", ""));
        } catch (NumberFormatException e) {
            log.warn("Could not parse travelRadiusKm from value '{}'", travelRadius);
            return null;
        }
    }

    private String buildCertifiedCategories(KycSubmission submission) {
        Set<String> categories = new LinkedHashSet<>();
        if (submission.getPrimaryService() != null) {
            categories.add(submission.getPrimaryService());
        }
        categories.addAll(kycMapper.fromJson(submission.getAdditionalServices()));
        return String.join(",", categories);
    }

    public void rejectKyc(String identifier, String reviewNotes) {
        KycSubmission submission = kycRepository.findByApplicantIdentifier(identifier)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found for identifier: " + identifier));

        submission.setStatus(KycStatus.REJECTED);
        submission.setReviewedAt(Instant.now());
        submission.setReviewNotes(reviewNotes);
        kycRepository.save(submission);

        // NOTE: this was missing before — applicant never got told why they were rejected.
        emailService.sendKycRejectionEmail(submission.getEmail(), submission.getFullName(),
                submission.getReferenceNumber(), reviewNotes);
    }

    /**
     * Option B video audit: admin manually creates the Meet event in
     * servicelink@1607gmail.com's own Calendar and pastes the link here.
     * No Calendar API / service account involved.
     */
    @Transactional
    public void scheduleVideoAudit(String identifier, ScheduleVideoAuditRequestDTO req) {
        KycSubmission submission = kycRepository.findByApplicantIdentifier(identifier)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found for identifier: " + identifier));

        LocalDateTime meetDateTime = LocalDateTime.parse(req.getMeetDate() + "T" + req.getMeetTime());
        Instant scheduledAt = meetDateTime.atZone(ZoneId.of("Asia/Kathmandu")).toInstant();

        submission.setStatus(KycStatus.UNDER_REVIEW);
        submission.setScheduledMeetLink(req.getMeetLink());
        submission.setScheduledMeetAt(scheduledAt);
        kycRepository.save(submission);

        if (req.isSendEmail()) {
            emailService.sendKycVideoAuditEmail(submission.getEmail(), submission.getFullName(),
                    req.getMeetLink(), scheduledAt);
        }
        // WhatsApp: not wired yet — no provider configured
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

    public KycStatusResponseDTO getStatus(String identifier) {
        KycSubmission submission = kycRepository
                .findByApplicantIdentifier(identifier)
                .orElseThrow(() ->
                        new IllegalArgumentException("No KYC submission found."));

        return KycStatusResponseDTO.builder()
                .status(submission.getStatus().name())
                .referenceNumber(submission.getReferenceNumber())
                .submittedAt(submission.getSubmittedAt())
                .reviewedAt(submission.getReviewedAt())
                .reviewNotes(submission.getReviewNotes())
                .fullName(submission.getFullName())
                .email(submission.getEmail())
                .build();
    }

    public PublicKycStatusResponseDTO getStatusByReferenceNumber(String referenceNumber) {
        log.info("Polling reference = {}", referenceNumber);

        KycSubmission submission = kycRepository.findByReferenceNumber(referenceNumber)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No submission found for reference number: " + referenceNumber));

        log.info("Found submission id = {}", submission.getId());
        log.info("Found status = {}", submission.getStatus());

        return PublicKycStatusResponseDTO.builder()
                .referenceNumber(submission.getReferenceNumber())
                .status(submission.getStatus().name())
                .submittedAt(submission.getSubmittedAt())
                .reviewedAt(submission.getReviewedAt())
                .reviewNotes(submission.getReviewNotes())
                .build();
    }
}