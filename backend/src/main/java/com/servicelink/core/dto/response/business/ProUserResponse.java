package com.servicelink.core.dto.response.business;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProUserResponse {

    private Long id;
    private Long workspaceId;
    private Long organizationId;
    private String fullName;
    private String role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Added fields to consolidate loading
    private String workspaceName;
    private String organizationName;
    private String logoUrl;
    private String businessType;
    private String planType;
    private String subscriptionStatus;
    private String trialEndsAt;
}
