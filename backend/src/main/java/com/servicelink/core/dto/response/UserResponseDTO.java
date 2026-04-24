package com.servicelink.core.dto.response;
import java.time.LocalDateTime;

import com.servicelink.core.model.AuthProvider;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// @Data
// @Builder
// public class UserResponseDTO {
//     private String email;
//     private String fullName;
//     private String profileImage;
// }

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    private Long id;
    private String email;
    private String fullName;
    private String profileImage;
    // private String provider;
    private AuthProvider provider;
    private boolean verified;
    private LocalDateTime createdAt;
}