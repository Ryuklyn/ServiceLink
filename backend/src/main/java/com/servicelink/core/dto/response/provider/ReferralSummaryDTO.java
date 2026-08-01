package com.servicelink.core.dto.response.provider;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class ReferralSummaryDTO {
    private String referralCode;
    private int progress;
    private int total;
    private int freeMonthsEarned;
    private List<ReferralHistoryDTO> history;
}