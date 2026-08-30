package com.servicelink.core.controller.business;

import com.servicelink.core.dto.request.business.ProUserRequest;
import com.servicelink.core.dto.response.business.ProUserResponse;
import com.servicelink.core.mapper.business.ProUserMapper;
import com.servicelink.core.model.user.User;
import com.servicelink.core.repository.business.ProUserRepository;
import com.servicelink.core.repository.business.TeamMemberRepository;
import com.servicelink.core.service.business.ProUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.servicelink.core.model.business.Workspace;
import com.servicelink.core.model.business.Subscription;
import com.servicelink.core.repository.business.WorkspaceRepository;
import com.servicelink.core.repository.business.SubscriptionRepository;
import java.util.Map;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/business/pro-user")
public class ProUserController {

    private final ProUserService proUserService;
    private final ProUserRepository proUserRepository;
    private final TeamMemberRepository teamMemberRepository; // ← new
    private final ProUserMapper proUserMapper;
    private final WorkspaceRepository workspaceRepository;
    private final SubscriptionRepository subscriptionRepository;

    @PostMapping("/create")
    public ResponseEntity<?> create(@Valid @RequestBody ProUserRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(proUserService.create(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<ProUserResponse> getByWorkspaceId(@PathVariable Long workspaceId) {
        try {
            return ResponseEntity.ok(proUserService.findByWorkspaceId(workspaceId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProUserResponse> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(proUserService.findById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ProUserResponse> getMe(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof User user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String role = teamMemberRepository.findByUser_Id(user.getId())
                .map(tm -> tm.getRole().name())
                .orElse(null);

        ProUserResponse resp = null;
        Optional<ProUserResponse> ownerResponse = proUserRepository.findByUser_Id(user.getId())
                .map(proUserMapper::toResponse);

        if (ownerResponse.isPresent()) {
            resp = ownerResponse.get();
            resp.setRole(role); // owner's TeamMember row is always ADMIN
        } else {
            var memberOpt = teamMemberRepository.findByUser_Id(user.getId());
            if (memberOpt.isPresent()) {
                var member = memberOpt.get();
                resp = ProUserResponse.builder()
                        .workspaceId(member.getWorkspaceId())
                        .fullName(user.getFullName())
                        .role(member.getRole().name())
                        .build();
            }
        }

        if (resp == null) {
            return ResponseEntity.notFound().build();
        }

        // Enrich with Workspace, Organization, and Subscription info
        if (resp.getWorkspaceId() != null) {
            Optional<Workspace> wsOpt = workspaceRepository.findById(resp.getWorkspaceId());
            if (wsOpt.isPresent()) {
                Workspace ws = wsOpt.get();
                resp.setWorkspaceName(ws.getName());
                if (ws.getOrganization() != null) {
                    resp.setOrganizationId(ws.getOrganization().getId());
                    resp.setOrganizationName(ws.getOrganization().getCompanyName());
                    resp.setLogoUrl(ws.getOrganization().getLogoUrl());
                    resp.setBusinessType(ws.getOrganization().getBusinessType() != null ? ws.getOrganization().getBusinessType().name() : null);
                }
            }

            Optional<Subscription> subOpt = subscriptionRepository.findByWorkspaceId(resp.getWorkspaceId());
            if (subOpt.isPresent()) {
                Subscription sub = subOpt.get();
                resp.setPlanType(sub.getPlanType() != null ? sub.getPlanType().name() : null);
                resp.setSubscriptionStatus(sub.getSubscriptionStatus() != null ? sub.getSubscriptionStatus().name() : null);
                resp.setTrialEndsAt(sub.getTrialEndsAt() != null ? sub.getTrialEndsAt().toString() : null);
            }
        }

        return ResponseEntity.ok(resp);
    }
}