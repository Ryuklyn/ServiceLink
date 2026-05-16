package com.servicelink.core.dto.response.business;

import com.servicelink.core.model.business.BusinessType;
import com.servicelink.core.model.business.CompanySize;
import com.servicelink.core.model.business.RegistrationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class OrganizationResponse {
    private Long id;
    private String companyName;
    private BusinessType businessType;
    private CompanySize companySize;
    private String workEmail;
    private String contactNumber;
    private RegistrationStatus registrationStatus;
    private LocalDateTime createdAt;
}
