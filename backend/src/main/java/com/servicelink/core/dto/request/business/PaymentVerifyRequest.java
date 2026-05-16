package com.servicelink.core.dto.request.business;

import lombok.Data;

@Data
public class PaymentVerifyRequest {
    private String referenceId;          // our internal ref
    private String gatewayTransactionId; // returned by gateway in callback
    private String gateway;              // ESEWA or KHALTI
}
