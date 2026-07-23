package com.servicelink.core.dto.response.appointment;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class AppointmentPaymentInitiateResponseDTO {
    private String referenceId;
    private String gatewayRedirectUrl;
    private String gatewayMethod;          // "GET" (Khalti) or "POST" (eSewa form)
    private Map<String, String> gatewayFormFields; // present for eSewa, null for Khalti
    private String gateway;                // "ESEWA" | "KHALTI"
    private String status;                 // "INITIATED"
}