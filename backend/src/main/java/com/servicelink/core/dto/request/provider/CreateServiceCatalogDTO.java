    package com.servicelink.core.dto.request.provider;

    import com.servicelink.core.model.common.ServiceCategory;
    import com.servicelink.core.model.provider.ServiceCatalog;
    import jakarta.validation.constraints.Min;
    import jakarta.validation.constraints.NotBlank;
    import jakarta.validation.constraints.NotNull;
    import jakarta.validation.constraints.Size;
    import lombok.Data;

    @Data
    public class CreateServiceCatalogDTO {

        @NotNull
        private ServiceCategory category;

        @NotBlank
        @Size(max = 200)
        private String subServiceName;

        @Size(max = 100)
        private String defaultDuration;           // e.g. "45–60 mins"

        @NotNull
        private ServiceCatalog.PricingUnit pricingUnit;

        @Min(0)
        private Integer basePrice;                // NPR reference price
    }