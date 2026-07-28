package com.servicelink.core.dto.response.business;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InviteDetailsResponse {
    private String fullName;
    private String email;
    private String role;
    private String workspaceName;
    private boolean valid;
    private String message; // populated when valid = false
}