package com.servicelink.core.dto.request.provider;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProviderServiceDTO {

    @Min(1)
    private Integer customPrice;

    @Size(max = 100)
    private String customDuration;

    private Boolean isAvailable;
}

