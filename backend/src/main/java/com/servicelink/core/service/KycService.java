package com.servicelink.core.service;

import com.servicelink.core.dto.request.KycSubmitRequestDTO;
import com.servicelink.core.dto.request.admin.ScheduleVideoAuditRequestDTO;
import com.servicelink.core.dto.response.KycStatusResponseDTO;
import com.servicelink.core.dto.response.KycSubmitResponseDTO;
import com.servicelink.core.dto.response.admin.KycAdminDetailDTO;
import com.servicelink.core.dto.response.admin.KycAdminListItemDTO;
import com.servicelink.core.dto.response.kyc.PublicKycStatusResponseDTO;
import com.servicelink.core.dto.response.kyc.KycDocumentDTO;
import com.servicelink.core.dto.response.kyc.ProviderKycDetailDTO;
import com.servicelink.core.mapper.KycMapper;
import com.servicelink.core.mapper.admin.KycAdminMapper;
import com.servicelink.core.model.auth.AuthProvider;
import com.servicelink.core.model.common.KycSubmission;
import com.servicelink.core.model.common.KycStatus;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.provider.service.Category;
import com.servicelink.core.model.user.User;
import com.servicelink.core.model.user.Role;
import com.servicelink.core.repository.KycRepository;
import com.servicelink.core.repository.provider.ProviderRepository;
import com.servicelink.core.repository.UserRepository;
import com.servicelink.core.repository.provider.service.CategoryRepository;
import com.servicelink.core.storage.SupabaseStorageService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashSet;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class KycService {

    private static final Logger log = LoggerFactory.getLogger(KycService.class);

    private final KycRepository          kycRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository         userRepository;
    private final ProviderRepository     providerRepository;
    private final SupabaseStorageService storageService;
    private final KycMapper              kycMapper;
    private final KycAdminMapper         kycAdminMapper;
    private final EmailService           emailService;
    private final GoogleCalendarService  googleCalendarService;

    // ─── Universal Resolver ───────────────────────────────────────────────────

    private KycSubmission findSubmissionByIdentifierOrId(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new IllegalArgumentException("Identifier must not be empty.");
        }

        if (identifier.matches("\\d+")) {
            Long id = Long.parseLong(identifier);
            Optional<KycSubmission> byId = kycRepository.findById(id);
            if (byId.isPresent()) {
                return byId.get();
            }
        }

        return kycRepository.findByApplicantIdentifier(identifier)
                .orElseGet(() -> kycRepository.findByReferenceNumber(identifier)
                        .orElseThrow(() -> new IllegalArgumentException("KYC submission not found for identifier or ID: " + identifier)));
    }

    // ─── Submit ───────────────────────────────────────────────────────────────

    @Transactional
    public KycSubmitResponseDTO submit(
            KycSubmitRequestDTO dto,
            String applicantIdentifier
    ) {
        Category primaryCategory = resolveActiveCategory(dto.getPrimaryCategoryId());

        Optional<User> userOpt = userRepository.findByEmailAndRole(applicantIdentifier, Role.PROVIDER);

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

    private Category resolveActiveCategory(Long categoryId) {
        if (categoryId == null) {
            throw new IllegalArgumentException("Primary service category is required.");
        }
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Selected primary category does not exist."));
        if (!Boolean.TRUE.equals(category.getIsActive())) {
            throw new IllegalArgumentException("Selected primary category is no longer active.");
        }
        return category;
    }

    // ─── Admin Infrastructure ─────────────────────────────────────────────────

    public List<KycSubmission> getPendingSubmissions() {
        return kycRepository.findByStatus(KycStatus.PENDING);
    }

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

    public KycAdminDetailDTO getDetailByIdentifier(String identifier) {
        KycSubmission submission = findSubmissionByIdentifierOrId(identifier);
        return kycAdminMapper.toDetail(submission);
    }

    // ─── Approve Decision ─────────────────────────────────────────────────────

    @Transactional
    public void approveKyc(String identifier, String reviewNotes) {
        KycSubmission submission = findSubmissionByIdentifierOrId(identifier);

        if (submission.getStatus() == KycStatus.APPROVED) {
            if (providerRepository.findByKycSubmission_Id(submission.getId()).isPresent()) {
                log.info("KYC for [{}] is already APPROVED and provisioned — skipping duplicate approval.",
                        mask(submission.getApplicantIdentifier()));
                return;
            }
            log.warn("KYC [{}] is APPROVED but has no Provider row; repairing provisioning.",
                    mask(submission.getApplicantIdentifier()));
        }

        validateProviderProvisioningData(submission);

        submission.setStatus(KycStatus.APPROVED);
        submission.setReviewedAt(Instant.now());

        // Save optional review note passed from DecisionModal
        if (reviewNotes != null && !reviewNotes.isBlank()) {
            submission.setReviewNotes(reviewNotes.trim());
        }

        kycRepository.save(submission);

        User user = resolveOrCreateProviderUser(submission, submission.getApplicantIdentifier());
        submission.setUser(user);
        kycRepository.save(submission);

        Category primaryCategory = resolveActiveCategory(submission.getPrimaryCategoryId());

        Provider provider = providerRepository.findByUser_Id(user.getId())
                .orElseGet(() -> Provider.builder().user(user).build());
        provider.syncFromKyc(submission, primaryCategory);

        provider.setEmail(user.getEmail());
        provider.setBaseDistrict(submission.getPrimaryDistrict());
        provider.setCoveredDistricts(submission.getSecondaryDistricts());
        provider.setProfilePictureUrl(submission.getProfilePhotoUrl());
        provider.setTravelRadiusKm(parseTravelRadiusKm(submission.getTravelRadius()));
        provider.setCertifiedCategories(buildCertifiedCategories(submission));

        provider.setIsVerified(true);
        provider.setIsActive(true);

        // Referral code is only captured during submission. Resolve its owner here
        // when the applicant becomes a real provider; never trust a client-supplied id.
        if (submission.getReferralCode() != null && !submission.getReferralCode().isBlank()) {
            providerRepository.findByReferralCode(submission.getReferralCode().trim().toUpperCase())
                    .filter(referrer -> Boolean.TRUE.equals(referrer.getIsActive()) && Boolean.TRUE.equals(referrer.getIsVerified()))
                    .filter(referrer -> !referrer.getUser().getId().equals(user.getId()))
                    .ifPresent(provider::setReferredBy);
        }

        providerRepository.save(provider);

        log.info("KYC Approved for identifier [{}]", mask(submission.getApplicantIdentifier()));
        log.info("Submission id = {}", submission.getId());
        log.info("Reference = {}", submission.getReferenceNumber());
        log.info("Provisioned Provider id = {} (userId = {})", provider.getId(), user.getId());

        emailService.sendKycApprovalEmail(submission.getEmail(), submission.getFullName(), submission.getReferenceNumber());
    }

    // ─── Reject Decision ──────────────────────────────────────────────────────

    @Transactional
    public void rejectKyc(String identifier, String reviewNotes) {
        KycSubmission submission = findSubmissionByIdentifierOrId(identifier);

        submission.setStatus(KycStatus.REJECTED);
        submission.setReviewedAt(Instant.now());

        // Trim and attach mandatory rejection reason note from DecisionModal
        String reasonNote = (reviewNotes != null && !reviewNotes.isBlank()) ? reviewNotes.trim() : null;
        submission.setReviewNotes(reasonNote);

        kycRepository.save(submission);

        log.info("KYC Rejected for identifier [{}]", mask(submission.getApplicantIdentifier()));

        emailService.sendKycRejectionEmail(
                submission.getEmail(),
                submission.getFullName(),
                submission.getReferenceNumber(),
                reasonNote
        );
    }

    @Transactional
    public void scheduleVideoAudit(String identifier, ScheduleVideoAuditRequestDTO req) {
        KycSubmission submission = findSubmissionByIdentifierOrId(identifier);

        // Calculate audit timestamp safely
        Instant scheduledAt;
        if (req.getScheduledAt() != null) {
            scheduledAt = req.getScheduledAt();
        } else if (req.getMeetDate() != null && req.getMeetTime() != null) {
            LocalDateTime meetDateTime = LocalDateTime.parse(req.getMeetDate() + "T" + req.getMeetTime());
            scheduledAt = meetDateTime.atZone(ZoneId.of("Asia/Kathmandu")).toInstant();
        } else {
            throw new IllegalArgumentException("Schedule date/time must be provided.");
        }

        String meetLink = req.getMeetLink();

        // Dynamically auto-generate Google Meet link if absent
        if (meetLink == null || meetLink.isBlank()) {
            try {
                meetLink = googleCalendarService.createMeetEventAndGetLink(
                        submission.getEmail(),
                        submission.getFullName(),
                        scheduledAt,
                        scheduledAt.plus(30, ChronoUnit.MINUTES)
                );
            } catch (Exception e) {
                log.error("Failed to generate Google Calendar event for [{}]", submission.getEmail(), e);
                throw new RuntimeException("Could not auto-generate Google Meet link: " + e.getMessage(), e);
            }
        }

        submission.setStatus(KycStatus.UNDER_REVIEW);
        submission.setScheduledMeetLink(meetLink);
        submission.setScheduledMeetAt(scheduledAt);
        kycRepository.save(submission);

        // Send email with confirmed meet link
        if (req.isSendEmail()) {
            emailService.sendKycVideoAuditEmail(
                    submission.getEmail(),
                    submission.getFullName(),
                    meetLink,
                    scheduledAt
            );
        }
    }

    // ─── Helpers & Status Queries ─────────────────────────────────────────────

    private User resolveOrCreateProviderUser(KycSubmission submission, String applicantIdentifier) {
        User user = submission.getUser();

        // Legacy submissions may point at the CUSTOMER account that initiated
        // KYC. Roles are separate identities now, so never reuse/convert it.
        if (user != null && user.getRole() != Role.PROVIDER) {
            user = null;
        }

        if (user == null && submission.getEmail() != null) {
            user = userRepository.findByEmailAndRole(
                    submission.getEmail().trim().toLowerCase(), Role.PROVIDER).orElse(null);
        }

        if (user != null) {
            log.info("Existing PROVIDER account [{}] linked following KYC approval.", mask(applicantIdentifier));
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
                .email(email.trim().toLowerCase())
                .provider(AuthProvider.LOCAL)
                .role(Role.PROVIDER)
                .verified(true)
                .password(null)
                .build();

        User saved = userRepository.save(newUser);
        log.info("Created new PROVIDER account for [{}] following KYC approval.", mask(applicantIdentifier));
        return saved;
    }

    private void validateProviderProvisioningData(KycSubmission submission) {
        if (submission.getEmail() == null || submission.getEmail().isBlank()) {
            throw new IllegalStateException("Provider KYC cannot be approved because email is missing.");
        }
        if (submission.getPhone() == null || submission.getPhone().isBlank()) {
            throw new IllegalStateException("Provider KYC cannot be approved because phone number is missing.");
        }
        if (submission.getFullName() == null || submission.getFullName().isBlank()) {
            throw new IllegalStateException("Provider KYC cannot be approved because full name is missing.");
        }
        if (submission.getPrimaryCategoryId() == null) {
            throw new IllegalStateException("Provider KYC cannot be approved because primary service is missing.");
        }
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
        if (submission.getPrimaryCategoryId() != null) {
            categories.add(String.valueOf(submission.getPrimaryCategoryId()));
        }
        categories.addAll(kycMapper.fromJson(submission.getAdditionalServices()));
        return String.join(",", categories);
    }

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
        KycSubmission submission = findSubmissionByIdentifierOrId(identifier);

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

    /** Returns only the authenticated provider's own KYC submission. */
    @Transactional(readOnly = true)
    public ProviderKycDetailDTO getProviderKycDetail(String authenticatedEmail) {
        // A provider may have submitted KYC using phone OTP, meaning
        // applicantIdentifier holds their phone while their active JWT subject
        // is their email. The Provider -> KYC relationship is authoritative.
        KycSubmission submission = userRepository.findByEmailAndRole(authenticatedEmail, Role.PROVIDER)
                .flatMap(user -> providerRepository.findByUser_Id(user.getId())
                        .map(Provider::getKycSubmission))
                .or(() -> kycRepository.findByEmail(authenticatedEmail))
                .or(() -> kycRepository.findByApplicantIdentifier(authenticatedEmail))
                .orElseThrow(() -> new IllegalArgumentException(
                        "No KYC submission is linked to this provider account."));
        List<KycDocumentDTO> documents = new ArrayList<>();
        addDocument(documents, "Citizenship Certificate — Front", submission.getCitizenshipFrontPath());
        addDocument(documents, "Citizenship Certificate — Back", submission.getCitizenshipBackPath());
        addDocument(documents, "KYC Profile Photo", submission.getPhotoPath());
        addDocument(documents, "PAN Card", submission.getPanPath());

        List<String> certificates = kycMapper.fromJson(submission.getProfessionalCertPaths());
        for (int index = 0; index < certificates.size(); index++) {
            addDocument(documents, "Professional Certificate " + (index + 1), certificates.get(index));
        }

        return ProviderKycDetailDTO.builder()
                .status(submission.getStatus().name())
                .submittedAt(submission.getSubmittedAt())
                .reviewedAt(submission.getReviewedAt())
                .reviewNotes(submission.getReviewNotes())
                .documents(documents)
                .build();
    }

    private void addDocument(List<KycDocumentDTO> documents, String name, String url) {
        if (url != null && !url.isBlank()) {
            documents.add(KycDocumentDTO.builder().name(name).url(url).build());
        }
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
