// KycStatusResponseDTO.java
package com.servicelink.core.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.Instant;

@Data
@Builder
public class KycStatusResponseDTO {
    private String referenceNumber;
    private String status;
    private Instant submittedAt;
    private Instant reviewedAt;
    private String reviewNotes;
}