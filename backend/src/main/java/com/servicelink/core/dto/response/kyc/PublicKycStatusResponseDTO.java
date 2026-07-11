package com.servicelink.core.dto.response.kyc;


import lombok.Builder;
import lombok.Data;
import java.time.Instant;

@Data
@Builder
public class PublicKycStatusResponseDTO {
    private String referenceNumber;
    private String status;
    private Instant submittedAt;
    private Instant reviewedAt;
    private String reviewNotes;
}
