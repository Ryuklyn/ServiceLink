package com.servicelink.core.dto.response.provider;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReferralCodeValidationDTO {
    private boolean valid;
    private String providerName;
    private String profilePictureUrl;
    private String serviceCategory;
}
