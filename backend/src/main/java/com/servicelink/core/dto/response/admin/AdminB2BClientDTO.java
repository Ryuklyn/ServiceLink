package com.servicelink.core.dto.response.admin;

import com.servicelink.core.model.business.KybStatus;
import com.servicelink.core.model.business.PlanType;
import com.servicelink.core.model.business.RegistrationStatus;
import com.servicelink.core.model.business.SubscriptionStatus;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class AdminB2BClientDTO {
    Long organizationId;
    Long workspaceId;
    Long proUserId;
    Long adminUserId;
    String companyName;
    String businessType;
    String companySize;
    String workEmail;
    String contactNumber;
    String workspaceName;
    String primaryBranchLocation;
    String adminName;
    String adminEmail;
    String taxId;
    KybStatus kybStatus;
    RegistrationStatus registrationStatus;
    PlanType planType;
    SubscriptionStatus subscriptionStatus;
    LocalDateTime createdAt;
}
