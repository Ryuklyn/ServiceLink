package com.servicelink.core.dto.request.provider.service;

import com.servicelink.core.model.provider.ServiceCatalog;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateServiceCatalogDTO {

    @Size(max = 200)
    private String subServiceName;

    @Size(max = 100)
    private String defaultDuration;

    private ServiceCatalog.PricingUnit pricingUnit;

    @Min(0)
    private Integer basePrice;
}
