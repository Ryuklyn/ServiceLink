package com.servicelink.core.dto.request.provider;


import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateOnlineStatusDTO {

    @NotNull
    private Boolean isOnline;
}

