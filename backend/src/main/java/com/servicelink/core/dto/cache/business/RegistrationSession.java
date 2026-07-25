package com.servicelink.core.dto.cache.business;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationSession {
    private Long organizationId;
    private Long workspaceId;
    private Long proUserId;
    private Long kybId;
    private String lastCompletedStep;
    private LocalDateTime updatedAt;
}
