package com.servicelink.core.dto.response;

import lombok.Data;

@Data
public class GoogleLoginDTO {
    private String email;
    private String fullName;
    private String profileImage;
}
