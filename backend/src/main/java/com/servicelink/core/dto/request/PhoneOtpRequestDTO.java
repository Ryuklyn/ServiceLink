// PhoneOtpRequestDTO.java
package com.servicelink.core.dto.request;

import lombok.Data;

@Data
public class PhoneOtpRequestDTO {
    private String phone; // E.164 format: +977XXXXXXXXXX
}