package com.servicelink.core.dto.response.admin.subscription;

import com.servicelink.core.dto.response.business.PaymentTransactionResponse;
import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class SubscriptionHistoryDTO {
    AdminSubscriptionRowDTO subscription;
    List<PaymentTransactionResponse> transactions;
    List<SystemEventDTO> events; // empty until a real audit log exists — see SystemEventDTO
}