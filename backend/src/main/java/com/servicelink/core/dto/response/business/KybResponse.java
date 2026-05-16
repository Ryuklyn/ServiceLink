package com.servicelink.core.dto.response.business;

import com.servicelink.core.model.business.KybStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class KybResponse {
    private Long id;
    private Long organizationId;
    private String taxId;
    private String documentUrl;
    private Boolean authorizedConfirmed;
    private KybStatus status;
    private LocalDateTime createdAt;

}
