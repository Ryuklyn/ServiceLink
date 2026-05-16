package com.servicelink.core.mapper.business;

import com.servicelink.core.dto.request.business.WorkspaceRequest;
import com.servicelink.core.dto.response.business.WorkspaceResponse;
import com.servicelink.core.model.business.Organization;
import com.servicelink.core.model.business.Workspace;
import org.springframework.stereotype.Component;

@Component
public class WorkspaceMapper {

    public Workspace toEntity(WorkspaceRequest request, Organization organization){
        return Workspace.builder()
                .name(request.getName().trim())
                .primaryBranchLocation(request.getPrimaryBranchLocation())
                .preferredServices(request.getPreferredServices())
                .organization(organization)
                .build();
    }

    public WorkspaceResponse toResponse(Workspace workspace){
        return WorkspaceResponse.builder()
                .id(workspace.getId())
                .organizationId(workspace.getOrganization().getId())
                .name(workspace.getName())
                .primaryBranchLocation(workspace.getPrimaryBranchLocation())
                .preferredBranchLocation(workspace.getPreferredServices())
                .createdAt(workspace.getCreatedAt())
                .build();
    }


}
