package com.servicelink.core.dto.response;

import java.time.LocalDateTime;

import com.servicelink.core.model.AuthProvider;
import lombok.Data;

@Data
public class UserResponseDTO {
    private Long id;
    private String email;
    private String fullName;
    private String profileImage;
    private String provider;
    private boolean verified;
    private LocalDateTime createdAt;

    public void setProvider(AuthProvider provider) {
    }
}
