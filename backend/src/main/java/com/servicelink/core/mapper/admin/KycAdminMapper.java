package com.servicelink.core.mapper.admin;

import com.servicelink.core.dto.response.admin.KycAdminDetailDTO;
import com.servicelink.core.dto.response.admin.KycAdminListItemDTO;
import com.servicelink.core.mapper.KycMapper;
import com.servicelink.core.model.common.KycSubmission;
import com.servicelink.core.model.provider.service.Category;
import com.servicelink.core.repository.provider.service.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class KycAdminMapper {

    private final KycMapper kycMapper; // reuses fromJson() for additionalServices / secondaryDistricts / certPaths
    private final CategoryRepository categoryRepository;

    private String resolvePrimaryServiceName(Long categoryId) {
        if (categoryId == null) return null;
        return categoryRepository.findById(categoryId).map(Category::getName).orElse(null);
    }

    public KycAdminListItemDTO toListItem(KycSubmission s) {
        return KycAdminListItemDTO.builder()
                .id(s.getId())
                .referenceNumber(s.getReferenceNumber())
                .applicantIdentifier(s.getApplicantIdentifier())
                .fullName(s.getFullName())
                .email(s.getEmail())
                .phone(s.getPhone())
                .photoUrl(resolvePhotoUrl(s)) // Fixed: Added missing photoUrl mapping
                .primaryService(resolvePrimaryServiceName(s.getPrimaryCategoryId()))
                .status(s.getStatus().name())
                .submittedAt(s.getSubmittedAt())
                .build();
    }

    public KycAdminDetailDTO toDetail(KycSubmission s) {
        return KycAdminDetailDTO.builder()
                .id(s.getId())
                .referenceNumber(s.getReferenceNumber())
                .applicantIdentifier(s.getApplicantIdentifier())
                .status(s.getStatus().name())
                .fullName(s.getFullName())
                .dob(s.getDob())
                .gender(s.getGender())
                .phone(s.getPhone())
                .email(s.getEmail())
                .province(s.getProvince())
                .district(s.getDistrict())
                .municipality(s.getMunicipality())
                .ward(s.getWard())
                .tole(s.getTole())
                .primaryService(resolvePrimaryServiceName(s.getPrimaryCategoryId()))
                .otherService(s.getOtherService())
                .additionalServices(kycMapper.fromJson(s.getAdditionalServices()))
                .experienceYears(s.getExperienceYears())
                .primaryDistrict(s.getPrimaryDistrict())
                .secondaryDistricts(kycMapper.fromJson(s.getSecondaryDistricts()))
                .travelRadius(s.getTravelRadius())
                .bio(s.getBio())
                .citizenshipFrontPath(s.getCitizenshipFrontPath())
                .citizenshipBackPath(s.getCitizenshipBackPath())
                .photoPath(s.getPhotoPath())
                .panPath(s.getPanPath())
                .professionalCertPaths(kycMapper.fromJson(s.getProfessionalCertPaths()))
                .profilePhotoUrl(resolvePhotoUrl(s)) // Fixed: Added fallback resolver
                .submittedAt(s.getSubmittedAt())
                .reviewedAt(s.getReviewedAt())
                .reviewNotes(s.getReviewNotes())
                .scheduledMeetLink(s.getScheduledMeetLink())
                .scheduledMeetAt(s.getScheduledMeetAt())
                .build();
    }

    /**
     * Resolves profile photo URL with fallback to photoPath if profilePhotoUrl is null or empty.
     */
    private String resolvePhotoUrl(KycSubmission s) {
        if (s.getProfilePhotoUrl() != null && !s.getProfilePhotoUrl().isBlank()) {
            return s.getProfilePhotoUrl();
        }
        return s.getPhotoPath();
    }
}