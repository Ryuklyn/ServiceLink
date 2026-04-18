package com.servicelink.core.dto.response;

import lombok.Data;

@Data
public class AuthResponseDTO {
    private String token;
    private UserResponseDTO user;
}
