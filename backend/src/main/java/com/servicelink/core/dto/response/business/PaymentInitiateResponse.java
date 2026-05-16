package com.servicelink.core.dto.response.business;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentInitiateResponse {
    private String referenceId;
    private String gatewayRedirectUrl; // Full URL to redirect user to eSewa/Khalti
    private String gateway;
    private String status;

}
