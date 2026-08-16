package com.servicelink.core.dto.response;
import com.servicelink.core.model.user.TwoFactorMethod;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponseDTO {
    private String token;
    private String refreshToken;
    private String email;
    private String fullName;
    private String profileImage;
    private boolean requiresProfileImage;
    private String role;
    private String message; // for registration success or error messages

    @Builder.Default
    private boolean requiresTwoFactor = false;

    private String preAuthToken;
    private TwoFactorMethod twoFactorMethod;
}