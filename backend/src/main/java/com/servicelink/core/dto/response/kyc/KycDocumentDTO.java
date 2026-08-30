package com.servicelink.core.dto.response.kyc;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class KycDocumentDTO {
    private String name;
    private String url;
}
