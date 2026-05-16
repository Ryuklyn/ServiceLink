package com.servicelink.core.mapper.business;

import com.servicelink.core.dto.request.business.OrganizationRequest;
import com.servicelink.core.dto.response.business.OrganizationResponse;
import com.servicelink.core.model.business.Organization;
import org.springframework.stereotype.Component;

@Component
public class OrganizationMapper {

    public Organization toEntity(OrganizationRequest request){
        return Organization.builder()
                .companyName(request.getCompanyName())
                .businessType(request.getBusinessType())
                .companySize(request.getCompanySize())
                .workEmail(request.getWorkEmail().toLowerCase().trim())
                .contactNumber(request.getContactNumber())
                .build();
    }

    public OrganizationResponse toResponse(Organization organization){

        return OrganizationResponse.builder()
                .id(organization.getId())
                .companyName(organization.getCompanyName())
                .businessType(organization.getBusinessType())
                .companySize(organization.getCompanySize())
                .workEmail(organization.getWorkEmail())
                .contactNumber(organization.getContactNumber())
                .registrationStatus(organization.getRegistrationStatus())
                .createdAt(organization.getCreatedAt())
                .build();
    }
}
