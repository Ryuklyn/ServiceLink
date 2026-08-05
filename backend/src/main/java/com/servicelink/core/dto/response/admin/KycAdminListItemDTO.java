package com.servicelink.core.dto.response.admin;

import lombok.Builder;
import lombok.Data;
import java.time.Instant;

@Data
@Builder
public class KycAdminListItemDTO {
    private Long id;
    private String referenceNumber;
    private String applicantIdentifier;
    private String fullName;
    private String email;
    private String phone;
    private String photoUrl;
    private String primaryService;
    private String status;          // KycStatus name(): PENDING | UNDER_REVIEW | APPROVED | REJECTED
    private Instant submittedAt;
}