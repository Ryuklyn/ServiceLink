// KycSubmitResponseDTO.java
package com.servicelink.core.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.Instant;

@Data
@Builder
public class KycSubmitResponseDTO {
    private String referenceNumber;
    private String status;
    private Instant submittedAt;
    private String applicantName;
    private String applicantEmail;
    private String message;
}