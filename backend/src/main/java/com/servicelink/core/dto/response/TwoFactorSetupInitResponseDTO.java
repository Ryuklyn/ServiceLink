package com.servicelink.core.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorSetupInitResponseDTO {
    private String qrCodeImageBase64; // data:image/png;base64,...
    private String manualSetupKey;    // Base32 secret, for manual entry
}
