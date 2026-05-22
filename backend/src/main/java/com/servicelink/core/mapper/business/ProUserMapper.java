package com.servicelink.core.mapper.business;

import com.servicelink.core.dto.request.business.ProUserRequest;
import com.servicelink.core.dto.response.business.ProUserResponse;
import com.servicelink.core.model.business.ProUser;
import com.servicelink.core.model.business.Workspace;
import org.springframework.stereotype.Component;

@Component
public class ProUserMapper {

    public ProUser toEntity(ProUserRequest request, Workspace workspace, String hashedPassword) {
        return ProUser.builder()
                .fullName(request.getFullName())
                .password(hashedPassword)
                .workspace(workspace)
                .build();
    }

    public ProUserResponse toResponse(ProUser proUser) {
        return ProUserResponse.builder()
                .id(proUser.getId())
                .workspaceId(proUser.getWorkspace().getId())
                .fullName(proUser.getFullName())
                .createdAt(proUser.getCreatedAt())
                .updatedAt(proUser.getUpdatedAt())
                .build();
    }
}
