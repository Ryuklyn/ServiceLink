package com.servicelink.core.dto.request.business;

import com.servicelink.core.model.business.PaymentGateway;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;


@Data
public class PaymentInitiateRequest {

    @NotNull(message = "Subscription ID is required")
    private Long subscriptionId;

    @NotNull(message = "PaymentGateway is required")
    private PaymentGateway paymentGateway; //Esewa and Khalti

    @NotNull(message = "Amount is required")
    @Positive
    private Long amountNpr;

    // Frontend return URLs (where gateway sends user back)
    @NotBlank
    private String successUrl; // e.g. http://localhost:3001/register/payment/success

    @NotBlank
    private String failureUrl; // e.g. http://localhost:3001/register/payment/failed

}
