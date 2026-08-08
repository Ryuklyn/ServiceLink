package com.servicelink.core.dto.response.provider.service;

import com.servicelink.core.model.provider.ServiceCatalog;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProviderServiceDTO {

    private Long                       id;
    private Long                       catalogId;
    private String                     subServiceName;
    private Long                       categoryId;
    private String                     categoryName;
    private ServiceCatalog.PricingUnit pricingUnit;
    private Integer                    customPrice;
    private String                     effectiveDuration;
    private Boolean                    isAvailable;
}
