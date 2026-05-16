package com.servicelink.core.dto.response.business;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class WorkspaceResponse {
    private Long id;
    private Long organizationId;
    private String name;
    private String primaryBranchLocation;
    private List<String> preferredBranchLocation;
    private LocalDateTime createdAt;
}
