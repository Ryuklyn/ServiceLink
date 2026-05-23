package com.servicelink.core.dto.response.business;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class PaymentInitiateResponse {
    private String referenceId;
    private String gatewayRedirectUrl; // Full URL to redirect user to eSewa/Khalti
    private String gatewayMethod;
    private Map<String, String> gatewayFormFields;
    private String gateway;
    private String status;

}
