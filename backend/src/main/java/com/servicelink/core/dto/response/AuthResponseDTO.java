package com.servicelink.core.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponseDTO {
    private String token;
//    private UserResponseDTO user;
    private String email;
    private String fullName;
    private String profileImage;
    private String message;

    private boolean requiresProfileImage;
}
