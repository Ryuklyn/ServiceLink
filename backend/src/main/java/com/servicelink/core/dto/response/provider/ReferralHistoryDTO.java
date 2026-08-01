package com.servicelink.core.dto.response.provider;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
public class ReferralHistoryDTO {
    private String name;
    private String category;
    private Instant joinedDate;
    private String kycStatus;      // Provider.kycSubmission.status
    private String paymentStatus;  // see note below
    private boolean counts;
}
