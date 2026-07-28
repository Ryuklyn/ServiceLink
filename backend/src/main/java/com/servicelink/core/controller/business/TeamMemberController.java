package com.servicelink.core.controller.business;

import com.servicelink.core.dto.request.business.AcceptInviteRequest;
import com.servicelink.core.dto.request.business.InviteTeamMemberRequest;
import com.servicelink.core.dto.response.AuthResponseDTO;
import com.servicelink.core.dto.response.business.InviteDetailsResponse;
import com.servicelink.core.dto.response.business.TeamMemberResponse;
import com.servicelink.core.model.business.TeamMember;
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
    private final TeamMemberRepository teamMemberRepository; // ← naya dependency

    private Long currentWorkspaceId(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof User user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        // Case 1: workspace owner (has a ProUser record)
        return proUserRepository.findByUser_Id(user.getId())
                .map(proUser -> proUser.getWorkspace().getId())
                // Case 2: invited team member (no ProUser, but has a TeamMember record)
                .orElseGet(() -> teamMemberRepository.findByUser_Id(user.getId())
                        .map(TeamMember::getWorkspaceId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "No workspace found")));
    }

    @GetMapping
    public ResponseEntity<List<TeamMemberResponse>> list(Authentication auth) {
        return ResponseEntity.ok(teamMemberService.listMembers(currentWorkspaceId(auth)));
    }

    @PostMapping("/invite")
    public ResponseEntity<TeamMemberResponse> invite(
            Authentication auth, @Valid @RequestBody InviteTeamMemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(teamMemberService.invite(currentWorkspaceId(auth), request));
    }

    @PostMapping("/{id}/resend")
    public ResponseEntity<TeamMemberResponse> resend(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(teamMemberService.resendInvite(currentWorkspaceId(auth), id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(Authentication auth, @PathVariable Long id) {
        teamMemberService.removeMember(currentWorkspaceId(auth), id);
        return ResponseEntity.noContent().build();
    }

    // ── Public endpoints (no auth — used by the invite-acceptance page) ──

    @GetMapping("/invite/{token}")
    public ResponseEntity<InviteDetailsResponse> getInviteDetails(@PathVariable String token) {
        return ResponseEntity.ok(teamMemberService.getInviteDetails(token));
    }

    @PostMapping("/accept-invite")
    public ResponseEntity<AuthResponseDTO> acceptInvite(@Valid @RequestBody AcceptInviteRequest request) {
        return ResponseEntity.ok(teamMemberService.acceptInvite(request));
    }
}