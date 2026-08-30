package com.servicelink.core.dto.response.provider;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CheckAccountResponseDTO {
    private boolean pinExists;
    private String maskedContact;
    private String email;
}