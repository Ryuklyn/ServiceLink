package com.servicelink.core.dto.response.business;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProUserResponse {

    private Long id;
    private Long workspaceId;
    private String fullName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
