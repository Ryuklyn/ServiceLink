package com.servicelink.core.dto.response;
import java.time.LocalDateTime;

import com.servicelink.core.model.auth.AuthProvider;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    private Long id;
    private String email;
    private String fullName;
    private String profileImage;
    private boolean phoneVerified;
    private String phoneNumber;
    // private String provider;
    private boolean hasSeenOnboarding;
    private AuthProvider provider;
    private boolean verified;
    private LocalDateTime createdAt;
}