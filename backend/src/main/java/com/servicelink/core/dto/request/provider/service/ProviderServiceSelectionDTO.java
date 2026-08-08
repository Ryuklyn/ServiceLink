package com.servicelink.core.dto.request.provider.service;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ProviderServiceSelectionDTO {
    private Long catalogId;

    @JsonProperty("isAvailable")
    private boolean isAvailable;

    private Integer customPrice;
}