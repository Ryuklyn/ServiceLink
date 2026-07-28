package com.servicelink.core.controller.business;

import com.servicelink.core.dto.request.business.AcceptInviteRequest;
import com.servicelink.core.dto.request.business.InviteTeamMemberRequest;
import com.servicelink.core.dto.request.business.UpdateTeamMemberRequest;
import com.servicelink.core.dto.response.AuthResponseDTO;
import com.servicelink.core.dto.response.business.InviteDetailsResponse;
import com.servicelink.core.dto.response.business.TeamMemberResponse;
import com.servicelink.core.model.business.TeamMember;
import com.servicelink.core.model.business.TeamRole;
import com.servicelink.core.model.user.User;
import com.servicelink.core.repository.business.ProUserRepository;
import com.servicelink.core.repository.business.TeamMemberRepository;
import com.servicelink.core.service.business.TeamMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/business/team")
public class TeamMemberController {

    private final TeamMemberService teamMemberService;
    private final ProUserRepository proUserRepository;
    private final TeamMemberRepository teamMemberRepository;

    private Long currentWorkspaceId(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof User user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return proUserRepository.findByUser_Id(user.getId())
                .map(proUser -> proUser.getWorkspace().getId())
                .orElseGet(() -> teamMemberRepository.findByUser_Id(user.getId())
                        .map(TeamMember::getWorkspaceId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "No workspace found")));
    }

    // Only the workspace ADMIN may invite, edit, resend, or remove members.
    // list() deliberately does NOT call this — everyone in the workspace can view the roster.
    private void assertAdmin(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof User user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        TeamRole role = teamMemberRepository.findByUser_Id(user.getId())
                .map(TeamMember::getRole)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "No workspace found"));
        if (role != TeamRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the workspace admin can perform this action");
        }
    }

    @GetMapping
    public ResponseEntity<List<TeamMemberResponse>> list(Authentication auth) {
        return ResponseEntity.ok(teamMemberService.listMembers(currentWorkspaceId(auth)));
    }

    @PostMapping("/invite")
    public ResponseEntity<TeamMemberResponse> invite(
            Authentication auth, @Valid @RequestBody InviteTeamMemberRequest request) {
        assertAdmin(auth);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(teamMemberService.invite(currentWorkspaceId(auth), request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TeamMemberResponse> update(
            Authentication auth, @PathVariable Long id, @Valid @RequestBody UpdateTeamMemberRequest request) {
        assertAdmin(auth);
        return ResponseEntity.ok(teamMemberService.updateMember(currentWorkspaceId(auth), id, request));
    }

    @PostMapping("/{id}/resend")
    public ResponseEntity<TeamMemberResponse> resend(Authentication auth, @PathVariable Long id) {
        assertAdmin(auth);
        return ResponseEntity.ok(teamMemberService.resendInvite(currentWorkspaceId(auth), id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(Authentication auth, @PathVariable Long id) {
        assertAdmin(auth);
        teamMemberService.removeMember(currentWorkspaceId(auth), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/invite/{token}")
    public ResponseEntity<InviteDetailsResponse> getInviteDetails(@PathVariable String token) {
        return ResponseEntity.ok(teamMemberService.getInviteDetails(token));
    }

    @PostMapping("/accept-invite")
    public ResponseEntity<AuthResponseDTO> acceptInvite(@Valid @RequestBody AcceptInviteRequest request) {
        return ResponseEntity.ok(teamMemberService.acceptInvite(request));
    }
}