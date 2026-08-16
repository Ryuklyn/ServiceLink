package com.servicelink.core.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorSetupVerifyResponseDTO {
    private List<String> backupCodes; // plaintext, shown ONCE
}