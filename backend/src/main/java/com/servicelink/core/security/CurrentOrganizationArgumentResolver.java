package com.servicelink.core.security;

import com.servicelink.core.model.business.ProUser;
import com.servicelink.core.model.business.Workspace;
import com.servicelink.core.model.user.User;
import com.servicelink.core.repository.business.ProUserRepository;
import com.servicelink.core.repository.business.TeamMemberRepository;
import com.servicelink.core.repository.business.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

/**
 * Resolves @CurrentOrganization parameters by extracting the organization ID
 * from the authenticated user's context.
 *
 * Flow:
 * 1. Get current User from SecurityContext
 * 2. Check if user is a ProUser (organization owner)
 *    → get organization ID via: ProUser → Workspace → Organization → id
 * 3. Otherwise check if user is a TeamMember
 *    → get organization ID via: TeamMember.workspaceId → Workspace → Organization → id
 * 4. If neither, throw exception
 */
@Component
@RequiredArgsConstructor
public class CurrentOrganizationArgumentResolver implements HandlerMethodArgumentResolver {

    private final ProUserRepository proUserRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final WorkspaceRepository workspaceRepository;

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.getParameterAnnotation(CurrentOrganization.class) != null
                && parameter.getParameterType().equals(Long.class);
    }

    @Override
    public Object resolveArgument(
            MethodParameter parameter,
            ModelAndViewContainer mavContainer,
            NativeWebRequest webRequest,
            WebDataBinderFactory binderFactory
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User user)) {
            throw new IllegalStateException("No authenticated user for @CurrentOrganization");
        }

        Long userId = user.getId();

        // Check if user is a ProUser (organization owner)
        ProUser proUser = proUserRepository.findByUser_Id(userId).orElse(null);
        if (proUser != null
                && proUser.getWorkspace() != null
                && proUser.getWorkspace().getOrganization() != null) {
            return proUser.getWorkspace().getOrganization().getId();
        }

        // Check if user is a TeamMember
        var teamMember = teamMemberRepository.findByUser_Id(userId).orElse(null);
        if (teamMember != null && teamMember.getWorkspaceId() != null) {
            Workspace workspace = workspaceRepository.findById(teamMember.getWorkspaceId()).orElse(null);
            if (workspace != null && workspace.getOrganization() != null) {
                return workspace.getOrganization().getId();
            }
        }

        // User has no organization
        throw new IllegalStateException(
                "User " + userId + " is not associated with any organization"
        );
    }
}
