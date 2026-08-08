package com.servicelink.core.dto.request.provider.service;

import com.servicelink.core.model.provider.ServiceCatalog;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Used only inside CreateCategoryWithServicesDTO — same fields as
 * CreateServiceCatalogDTO minus categoryId, since the parent category
 * doesn't exist yet when these rows are submitted.
 */
@Data
public class SubServiceInputDTO {

    @NotBlank
    @Size(max = 200)
    private String subServiceName;

    @Size(max = 100)
    private String defaultDuration;

    @NotNull
    private ServiceCatalog.PricingUnit pricingUnit;

    @Min(0)
    private Integer basePrice;
}
