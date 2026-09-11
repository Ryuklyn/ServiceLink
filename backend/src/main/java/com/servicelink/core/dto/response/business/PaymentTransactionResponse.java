package com.servicelink.core.dto.response.business;

import com.servicelink.core.model.business.PaymentGateway;
import com.servicelink.core.model.business.PaymentStatus;
import com.servicelink.core.model.provider.subscription.SubscriptionPlanType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PaymentTransactionResponse {
    private Long id;
    private String referenceId;
    private String gatewayTransactionId;
    private PaymentGateway gateway;
    private PaymentStatus status;
    private Long amountNpr;
    private SubscriptionPlanType purchasedPlanType;
    private LocalDateTime initiatedAt;
    private LocalDateTime completedAt;

}
