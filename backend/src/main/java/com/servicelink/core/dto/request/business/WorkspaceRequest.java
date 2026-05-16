package com.servicelink.core.dto.request.business;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class WorkspaceRequest {
    @NotNull(message = "Organization ID is required")
    private Long organizationId;

    @NotBlank(message = "Workspace name is require")
    @Size(max = 100)
    private String name;

    @NotBlank(message = "Primary Branch Location is required")
    @Size(max = 200)
    private String primaryBranchLocation;

    private List<String> preferredServices;
}
