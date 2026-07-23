package com.servicelink.core.dto.request.appointment;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AppointmentPaymentVerifyRequestDTO {

    @NotBlank(message = "referenceId is required")
    private String referenceId;

    /** Khalti: the pidx returned to the frontend after redirect. Optional for eSewa. */
    private String gatewayTransactionId;

    /** eSewa: base64 `data` query param from the success/failure redirect. Optional for Khalti. */
    private String gatewayResponseData;
}