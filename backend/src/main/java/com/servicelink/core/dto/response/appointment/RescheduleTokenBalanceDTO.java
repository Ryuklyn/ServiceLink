package com.servicelink.core.dto.response.appointment;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RescheduleTokenBalanceDTO {
    private int year;
    private int tokensTotal;
    private int tokensUsed;
    private int tokensRemaining;
}