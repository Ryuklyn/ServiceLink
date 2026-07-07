package com.servicelink.core.dto.response.provider;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyPinResponseDTO {
    private boolean verified;
    private String message;
    private String accessToken;
    private String refreshToken;
    private Integer attemptsLeft; // only populated on failure
}
