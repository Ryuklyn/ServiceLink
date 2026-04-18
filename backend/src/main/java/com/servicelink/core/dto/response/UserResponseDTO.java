package com.servicelink.core.dto.response;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class UserResponseDTO {
    private Long id;
    private String email;
    private String provider;
    private boolean isVerified;
    private LocalDateTime createdAt;

    private String fullName;
}
