// VerifyPhoneOtpRequestDTO.java
package com.servicelink.core.dto.request;

import lombok.Data;

@Data
public class VerifyPhoneOtpRequestDTO {
    private String phone;
    private String otp;
}