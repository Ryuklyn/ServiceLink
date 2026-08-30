package com.servicelink.core.dto.request.provider;

import lombok.Data;

@Data
public class CheckAccountRequestDTO {
    private String email;
    private String phone;
}