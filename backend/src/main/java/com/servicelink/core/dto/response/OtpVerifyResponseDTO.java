package com.servicelink.core.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OtpVerifyResponseDTO {
    private boolean verified;
    private String  message;
    /** Short-lived JWT issued after successful verification. Used to authenticate KYC submission. */
    private String  providerToken;
}
