package com.servicelink.core.dto.request.provider.subscription;

import com.servicelink.core.model.business.PaymentGateway;
import com.servicelink.core.model.business.PlanType;
import com.servicelink.core.model.provider.subscription.SubscriptionPlanType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubscriptionCheckoutRequestDTO {
    @NotNull
    private SubscriptionPlanType subscriptionPlanType;

    @NotNull
    private PaymentGateway paymentGateway;
    
}
