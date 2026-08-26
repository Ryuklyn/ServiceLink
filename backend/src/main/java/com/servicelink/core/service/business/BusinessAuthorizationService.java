package com.servicelink.core.service.business;

import com.servicelink.core.exception.BusinessException;
import com.servicelink.core.model.business.TeamMember;
import com.servicelink.core.model.business.TeamRole;
import com.servicelink.core.model.user.User;
import com.servicelink.core.repository.business.ProUserRepository;
import com.servicelink.core.repository.business.TeamMemberRepository;
import com.servicelink.core.repository.business.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Set;

/**
 * Organization-level RBAC for ServiceLink Pro. Spring authentication proves
 * identity; this service proves that the identity has the required role in
 * the organization resolved for the current request.
 */
@Service
@RequiredArgsConstructor
public class BusinessAuthorizationService {

    private final ProUserRepository proUserRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final WorkspaceRepository workspaceRepository;

    public void requireDirectoryAccess(User user, Long organizationId) {
        requireRole(user, organizationId, Set.of(TeamRole.ADMIN, TeamRole.MANAGER, TeamRole.STAFF));
    }

    public void requirePoolManagement(User user, Long organizationId) {
        requireRole(user, organizationId, Set.of(TeamRole.ADMIN, TeamRole.MANAGER));
    }

    public void requireRole(User user, Long organizationId, Set<TeamRole> allowedRoles) {
        if (user == null || organizationId == null) {
            throw new BusinessException("An authenticated organization member is required", "UNAUTHORIZED");
        }

        boolean isOwner = proUserRepository.findByUser_Id(user.getId())
                .map(proUser -> proUser.getWorkspace() != null
                        && proUser.getWorkspace().getOrganization() != null
                        && organizationId.equals(proUser.getWorkspace().getOrganization().getId()))
                .orElse(false);
        if (isOwner) return;

        TeamMember member = teamMemberRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new BusinessException("You are not a member of this organization", "FORBIDDEN"));
        boolean belongsToOrganization = workspaceRepository.findById(member.getWorkspaceId())
                .map(workspace -> workspace.getOrganization() != null
                        && organizationId.equals(workspace.getOrganization().getId()))
                .orElse(false);
        if (!belongsToOrganization || !allowedRoles.contains(member.getRole())) {
            throw new BusinessException("Your organization role cannot perform this action", "FORBIDDEN");
        }
    }
}
