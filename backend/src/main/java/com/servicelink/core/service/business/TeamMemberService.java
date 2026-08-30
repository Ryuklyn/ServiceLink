package com.servicelink.core.service.business;

import com.servicelink.core.dto.request.business.AcceptInviteRequest;
import com.servicelink.core.dto.request.business.InviteTeamMemberRequest;
import com.servicelink.core.dto.request.business.UpdateTeamMemberRequest;
import com.servicelink.core.dto.response.AuthResponseDTO;
import com.servicelink.core.dto.response.business.InviteDetailsResponse;
import com.servicelink.core.dto.response.business.TeamMemberResponse;
import com.servicelink.core.model.auth.AuthProvider;
import com.servicelink.core.model.business.InviteStatus;
import com.servicelink.core.model.business.ProUser;
import com.servicelink.core.model.business.TeamMember;
import com.servicelink.core.model.business.TeamRole;
import com.servicelink.core.model.business.Workspace;
import com.servicelink.core.model.user.Role;
import com.servicelink.core.model.user.User;
import com.servicelink.core.repository.UserRepository;
import com.servicelink.core.repository.business.ProUserRepository;
import com.servicelink.core.repository.business.TeamMemberRepository;
import com.servicelink.core.repository.business.WorkspaceRepository;
import com.servicelink.core.security.JwtService;
import com.servicelink.core.service.EmailService;
import com.servicelink.core.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TeamMemberService {

    private final TeamMemberRepository teamMemberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final ProUserRepository proUserRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Value("${app.frontend-url}")
    private String frontendBaseUrl;

    private static final Duration INVITE_TTL = Duration.ofDays(7);

    /**
     * Called once, right after a ProUser + Workspace are created (KYB approved /
     * registration complete), so the workspace owner shows up in the Team
     * Members list immediately as Admin + Accepted.
     *
     * NOTE: workspaceId here is Workspace.id, matching the existing
     * /api/business/pro-user/workspace/{workspaceId} convention.
     */
    @Transactional
    public void createAdminMemberForNewWorkspace(ProUser proUser, User adminUser) {
        Long workspaceId = proUser.getWorkspace().getId();

        if (teamMemberRepository.existsByWorkspaceIdAndEmail(workspaceId, adminUser.getEmail())) {
            return;
        }
        TeamMember admin = TeamMember.builder()
                .workspaceId(workspaceId)
                .fullName(proUser.getFullName())
                .email(adminUser.getEmail())
                .role(TeamRole.ADMIN)
                .inviteStatus(InviteStatus.ACCEPTED)
                .invitedAt(Instant.now())
                .lastActiveAt(Instant.now())
                .user(adminUser)
                .build();
        teamMemberRepository.save(admin);
    }

    @Transactional
    public List<TeamMemberResponse> listMembers(Long workspaceId) {
        ensureAdminMemberExists(workspaceId);

        return teamMemberRepository.findByWorkspaceIdOrderByIdAsc(workspaceId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Self-healing: guarantees the workspace owner always shows up as
     * Admin + Accepted in the Team Members list, even if
     * createAdminMemberForNewWorkspace() was never called (e.g. accounts
     * created before this feature existed, or the registration flow
     * doesn't call it yet).
     */
    private void ensureAdminMemberExists(Long workspaceId) {
        boolean hasAdmin = teamMemberRepository.findByWorkspaceIdOrderByIdAsc(workspaceId)
                .stream()
                .anyMatch(m -> m.getRole() == TeamRole.ADMIN);

        if (hasAdmin) return;

        ProUser proUser = proUserRepository.findByWorkspaceId(workspaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workspace not found"));

        User adminUser = proUser.getUser();

        TeamMember admin = TeamMember.builder()
                .workspaceId(workspaceId)
                .fullName(proUser.getFullName())
                .email(adminUser.getEmail())
                .role(TeamRole.ADMIN)
                .inviteStatus(InviteStatus.ACCEPTED)
                .invitedAt(Instant.now())
                .lastActiveAt(Instant.now())
                .user(adminUser)
                .build();

        teamMemberRepository.save(admin);
    }

    @Transactional
    public TeamMemberResponse invite(Long workspaceId, InviteTeamMemberRequest request) {
        TeamRole role;
        try {
            role = TeamRole.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + request.getRole());
        }
        if (role == TeamRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Admin role is reserved for the workspace owner");
        }

        if (teamMemberRepository.existsByWorkspaceIdAndEmail(workspaceId, request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This email is already part of the workspace");
        }

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workspace not found"));

        String token = UUID.randomUUID().toString();

        TeamMember member = TeamMember.builder()
                .workspaceId(workspaceId)
                .fullName(request.getFullName())
                .email(request.getEmail())
                .role(role)
                .inviteStatus(InviteStatus.PENDING)
                .inviteToken(token)
                .invitedAt(Instant.now())
                .build();

        teamMemberRepository.save(member);

        String link = frontendBaseUrl + "/login/business/team/accept-invite?token=" + token;
        emailService.sendTeamInviteEmail(request.getEmail(), request.getFullName(), workspace.getName(), link);

        return toResponse(member);
    }

    @Transactional
    public TeamMemberResponse resendInvite(Long workspaceId, Long memberId) {
        TeamMember member = getOwnedMember(workspaceId, memberId);
        if (member.getInviteStatus() != InviteStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This member has already accepted");
        }

        member.setInviteToken(UUID.randomUUID().toString());
        member.setInvitedAt(Instant.now());
        teamMemberRepository.save(member);

        Workspace workspace = workspaceRepository.findById(workspaceId).orElseThrow();
        String link = frontendBaseUrl + "/login/business/team/accept-invite?token=" + member.getInviteToken();
        emailService.sendTeamInviteEmail(member.getEmail(), member.getFullName(), workspace.getName(), link);

        return toResponse(member);
    }

    @Transactional
    public void removeMember(Long workspaceId, Long memberId) {
        TeamMember member = getOwnedMember(workspaceId, memberId);
        if (member.getRole() == TeamRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot remove the workspace admin");
        }
        teamMemberRepository.delete(member);
    }

    public InviteDetailsResponse getInviteDetails(String token) {
        return teamMemberRepository.findByInviteToken(token)
                .map(member -> {
                    if (member.getInviteStatus() == InviteStatus.ACCEPTED) {
                        return InviteDetailsResponse.builder().valid(false)
                                .message("This invitation has already been used").build();
                    }
                    if (Duration.between(member.getInvitedAt(), Instant.now()).compareTo(INVITE_TTL) > 0) {
                        return InviteDetailsResponse.builder().valid(false)
                                .message("This invitation link has expired").build();
                    }
                    Workspace workspace = workspaceRepository.findById(member.getWorkspaceId()).orElse(null);
                    return InviteDetailsResponse.builder()
                            .valid(true)
                            .fullName(member.getFullName())
                            .email(member.getEmail())
                            .role(member.getRole().name())
                            .workspaceName(workspace != null ? workspace.getName() : "")
                            .build();
                })
                .orElse(InviteDetailsResponse.builder().valid(false).message("Invalid invitation link").build());
    }

    @Transactional
    public AuthResponseDTO acceptInvite(AcceptInviteRequest request) {
        TeamMember member = teamMemberRepository.findByInviteToken(request.getToken())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid invitation link"));

        if (member.getInviteStatus() == InviteStatus.ACCEPTED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This invitation has already been used");
        }
        if (Duration.between(member.getInvitedAt(), Instant.now()).compareTo(INVITE_TTL) > 0) {
            throw new ResponseStatusException(HttpStatus.GONE, "This invitation link has expired");
        }

        User user = userRepository.findByEmailAndRole(member.getEmail(), Role.PRO)
                .orElseGet(() -> {
                    User u = new User();
                    u.setFullName(member.getFullName());
                    u.setEmail(member.getEmail());
                    u.setRole(Role.PRO);
                    u.setProvider(AuthProvider.LOCAL);
                    return u;
                });
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.PRO);
        userRepository.save(user);

        member.setUser(user);
        member.setInviteStatus(InviteStatus.ACCEPTED);
        member.setInviteToken(null);
        member.setLastActiveAt(Instant.now());
        teamMemberRepository.save(member);

        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail(), user.getRole());
        String jti = jwtService.extractJti(refreshToken);
        refreshTokenService.store(user.getEmail(), jti, refreshToken, jwtService.getRefreshTokenExpirationMillis());

        return AuthResponseDTO.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .build();
    }

    private TeamMember getOwnedMember(Long workspaceId, Long memberId) {
        TeamMember member = teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));
        if (!member.getWorkspaceId().equals(workspaceId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Member does not belong to this workspace");
        }
        return member;
    }

    private TeamMemberResponse toResponse(TeamMember m) {
        return TeamMemberResponse.builder()
                .id(m.getId())
                .fullName(m.getFullName())
                .email(m.getEmail())
                .role(m.getRole())
                .inviteStatus(m.getInviteStatus())
                .invitedAt(m.getInvitedAt())
                .lastActiveAt(m.getLastActiveAt())
                .build();
    }

    @Transactional
    public TeamMemberResponse updateMember(Long workspaceId, Long memberId, UpdateTeamMemberRequest request) {
        TeamMember member = getOwnedMember(workspaceId, memberId);

        if (member.getRole() == TeamRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot edit the workspace admin");
        }

        TeamRole role;
        try {
            role = TeamRole.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + request.getRole());
        }
        if (role == TeamRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin role is reserved for the workspace owner");
        }

        member.setFullName(request.getFullName());
        member.setRole(role);
        teamMemberRepository.save(member);

        // Keep the linked User account's name in sync once they've accepted
        if (member.getUser() != null) {
            member.getUser().setFullName(request.getFullName());
            userRepository.save(member.getUser());
        }

        return toResponse(member);
    }
}
