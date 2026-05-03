package com.servicelink.core.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OtpSendResponseDTO {
    private String message;
    private String deliveryMethod;   // "SMS" | "EMAIL" | "WHATSAPP_LINK"
    private String whatsappLink;     // non-null only when deliveryMethod = WHATSAPP_LINK
}
