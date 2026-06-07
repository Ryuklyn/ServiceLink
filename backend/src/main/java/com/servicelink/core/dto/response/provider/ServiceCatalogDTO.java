package com.servicelink.core.dto.response.provider;

import com.servicelink.core.model.common.ServiceCategory;
import com.servicelink.core.model.provider.ServiceCatalog;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ServiceCatalogDTO {

    private Long                       id;
    private ServiceCategory            category;
    private String                     subServiceName;
    private String                     defaultDuration;
    private ServiceCatalog.PricingUnit pricingUnit;
    private Integer                    basePrice;
    private Boolean                    isActive;
}