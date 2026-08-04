package com.servicelink.core.mapper.admin;

import com.servicelink.core.dto.response.admin.KycAdminDetailDTO;
import com.servicelink.core.dto.response.admin.KycAdminListItemDTO;
import com.servicelink.core.mapper.KycMapper;
import com.servicelink.core.model.common.KycSubmission;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class KycAdminMapper {

    private final KycMapper kycMapper; // reuses fromJson() for additionalServices / secondaryDistricts / certPaths

    public KycAdminListItemDTO toListItem(KycSubmission s) {
        return KycAdminListItemDTO.builder()
                .id(s.getId())
                .referenceNumber(s.getReferenceNumber())
                .applicantIdentifier(s.getApplicantIdentifier())
                .fullName(s.getFullName())
                .email(s.getEmail())
                .phone(s.getPhone())
                .primaryService(s.getPrimaryService())
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
                .primaryService(s.getPrimaryService())
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
                .profilePhotoUrl(s.getProfilePhotoUrl())
                .submittedAt(s.getSubmittedAt())
                .reviewedAt(s.getReviewedAt())
                .reviewNotes(s.getReviewNotes())
                .scheduledMeetLink(s.getScheduledMeetLink())
                .scheduledMeetAt(s.getScheduledMeetAt())
                .build();
    }
}