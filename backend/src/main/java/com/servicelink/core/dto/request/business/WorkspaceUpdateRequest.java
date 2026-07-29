package com.servicelink.core.dto.request.business;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class WorkspaceUpdateRequest {
    @Size(max = 200)
    private String primaryBranchLocation;

    private List<String> preferredServices;
}