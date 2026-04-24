package com.servicelink.core.dto.response;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponseDTO {
    private String token;
    private String email;
    private String fullName;
    private String profileImage;
    private boolean requiresProfileImage;
    private String message; // for registration success or error messages
}