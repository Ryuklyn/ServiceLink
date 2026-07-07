package com.servicelink.core.dto.response.provider;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SetPinResponseDTO {
    private String accessToken;
    private String refreshToken;
}
