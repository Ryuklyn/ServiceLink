package com.servicelink.core.dto.request.provider;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateProviderServiceDTO {

    @NotNull
    private Long catalogId;

    @NotNull
    @Min(1)
    private Integer customPrice;           // NPR

    @Size(max = 100)
    private String customDuration;         // e.g. "30–40 mins", null = use catalog default

    private Boolean isAvailable = true;
}
