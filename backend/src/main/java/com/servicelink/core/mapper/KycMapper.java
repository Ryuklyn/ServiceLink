package com.servicelink.core.mapper;

import com.servicelink.core.dto.request.KycSubmitRequestDTO;
import com.servicelink.core.dto.response.KycSubmitResponseDTO;
import com.servicelink.core.dto.response.KycStatusResponseDTO;
import com.servicelink.core.model.common.KycStatus;
import com.servicelink.core.model.common.KycSubmission;
import com.servicelink.core.model.user.User;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class KycMapper {

    // ─── Entity construction ──────────────────────────────────────────────────

    public KycSubmission toEntity(
            KycSubmitRequestDTO dto,
            User                user,
            String              applicantIdentifier
    ) {
        return KycSubmission.builder()
                .user(user)
                .applicantIdentifier(applicantIdentifier)
                .referenceNumber(generateReferenceNumber())
                .fullName(dto.getFullName())
                .dob(dto.getDob())
                .gender(dto.getGender())
                .phone(dto.getPhone())
                .email(dto.getEmail())   // ← ADDED
                .province(dto.getProvince())
                .district(dto.getDistrict())
                .municipality(dto.getMunicipality())
                .ward(dto.getWard())
                .tole(dto.getTole())
                .primaryService(dto.getPrimaryService())
                .otherService(dto.getOtherService())
                .additionalServices(toJson(dto.getAdditionalServices()))
                .experienceYears(dto.getExperienceYears())
                .primaryDistrict(dto.getPrimaryDistrict())
                .secondaryDistricts(toJson(dto.getSecondaryDistricts()))
                .travelRadius(dto.getTravelRadius())
                .bio(dto.getBio())
                .profilePhotoUrl(dto.getProfilePhotoUrl())
                .citizenshipFrontPath(dto.getCitizenshipFrontUrl())
                .citizenshipBackPath(dto.getCitizenshipBackUrl())
                .photoPath(dto.getPhotoUrl())
                .panPath(dto.getPanUrl())
                .professionalCertPaths(toJson(dto.getProfessionalCertUrls()))
                .status(KycStatus.PENDING)
                .submittedAt(Instant.now())
                .build();
    }
    // ─── Response mapping ─────────────────────────────────────────────────────

    public KycSubmitResponseDTO toSubmitResponse(KycSubmission submission, String email) {
        return KycSubmitResponseDTO.builder()
                .referenceNumber(submission.getReferenceNumber())
                .status(submission.getStatus().name())
                .submittedAt(submission.getSubmittedAt())
                .applicantName(submission.getFullName())
                .applicantEmail(email)
                .message("Application received. Review takes 2–3 business days.")
                .build();
    }

    public KycStatusResponseDTO toStatusResponse(KycSubmission submission) {
        return KycStatusResponseDTO.builder()
                .referenceNumber(submission.getReferenceNumber())
                .status(submission.getStatus().name())
                .submittedAt(submission.getSubmittedAt())
                .reviewedAt(submission.getReviewedAt())
                .reviewNotes(submission.getReviewNotes())
                .build();
    }

    // ─── JSON helpers ─────────────────────────────────────────────────────────

    private String toJson(List<String> list) {
        if (list == null || list.isEmpty()) return "[]";
        String joined = list.stream()
                .map(s -> "\"" + s.replace("\"", "\\\"") + "\"")
                .collect(Collectors.joining(","));
        return "[" + joined + "]";
    }

    public List<String> fromJson(String json) {
        if (json == null || json.isBlank() || json.equals("[]")) return List.of();
        String inner = json.trim().replaceAll("^\\[|\\]$", "");
        return Arrays.stream(inner.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)"))
                .map(s -> s.trim().replaceAll("^\"|\"$", ""))
                .filter(s -> !s.isBlank())
                .collect(Collectors.toList());
    }

    // ─── Reference number ─────────────────────────────────────────────────────

    private String generateReferenceNumber() {
        return "SVC-" + java.time.Year.now().getValue()
                + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}