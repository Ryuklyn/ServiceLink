package com.servicelink.core.mapper.business;

import com.servicelink.core.dto.response.business.KybResponse;
import com.servicelink.core.model.business.KybVerification;
import org.springframework.stereotype.Component;

@Component
public class KybMapper {

    public KybResponse toResponse(KybVerification kybVerification){
        return KybResponse.builder()
                .id(kybVerification.getId())
                .organizationId(kybVerification.getOrganization().getId())
                .taxId(kybVerification.getTaxId())
                .documentUrl(kybVerification.getDocumentImgUrl())
                .authorizedConfirmed(kybVerification.getAuthorizedConfirmed())
                .status(kybVerification.getStatus())
                .submittedAt(kybVerification.getSubmittedAt())
                .build();
    }

}
