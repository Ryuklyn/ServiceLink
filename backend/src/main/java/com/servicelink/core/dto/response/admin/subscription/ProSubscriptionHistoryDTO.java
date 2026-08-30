package com.servicelink.core.dto.response.admin.subscription;

import com.servicelink.core.dto.response.business.PaymentTransactionResponse;
import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class ProSubscriptionHistoryDTO {
    ProAdminSubscriptionRowDTO subscription;
    List<PaymentTransactionResponse> transactions;
    List<SystemEventDTO> events;
}
