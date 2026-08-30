package com.servicelink.core.dto.response.kyc;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

/** Authenticated provider's own KYC status and submitted documents. */
@Data
@Builder
public class ProviderKycDetailDTO {
    private String status;
    private Instant submittedAt;
    private Instant reviewedAt;
    private String reviewNotes;
    private List<KycDocumentDTO> documents;
}
