package com.servicelink.core.dto.response.admin.subscription;

import com.servicelink.core.model.business.PaymentGateway;
import com.servicelink.core.model.business.PaymentStatus;
import com.servicelink.core.model.provider.subscription.SubscriptionPlanType;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class PaymentAuditRowDTO {
    Long id;
    String referenceId;
    String gatewayTransactionId;
    Long providerId;
    String providerName;
    String providerEmail;
    SubscriptionPlanType purchasedPlanType;
    PaymentGateway gateway;
    Long amountNpr;
    PaymentStatus status;
    LocalDateTime initiatedAt;
    LocalDateTime completedAt;
}
