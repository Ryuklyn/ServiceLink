package com.servicelink.core.dto.response.provider.service;

import com.servicelink.core.model.provider.ServiceCatalog;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ServiceCatalogDTO {

    private Long                       id;
    private Long                       categoryId;
    private String                     categoryName;
    private String                     subServiceName;
    private String                     defaultDuration;
    private ServiceCatalog.PricingUnit pricingUnit;
    private ServiceCatalog.EstimationMode estimationMode;
    private String                     requiredInputLabel;
    private Integer                    basePrice;
    private Boolean                    isActive;
}