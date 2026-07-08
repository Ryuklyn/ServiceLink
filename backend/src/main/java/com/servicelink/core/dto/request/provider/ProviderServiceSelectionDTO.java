package com.servicelink.core.dto.request.provider;


import lombok.Data;

@Data
public class ProviderServiceSelectionDTO {
    private Long catalogId;
    private boolean isAvailable;
    private Integer customPrice;
}