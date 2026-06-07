package com.servicelink.core.dto.response.provider;

import com.servicelink.core.model.common.ServiceCategory;
import com.servicelink.core.model.provider.ServiceCatalog;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProviderServiceDTO {

    private Long                       id;
    private Long                       catalogId;
    private String                     subServiceName;
    private ServiceCategory            category;
    private ServiceCatalog.PricingUnit pricingUnit;
    private Integer                    customPrice;
    private String                     effectiveDuration;
    private Boolean                    isAvailable;
}
