package com.servicelink.core.controller.business;

import com.servicelink.core.dto.request.business.ProUserRequest;
import com.servicelink.core.dto.response.business.ProUserResponse;
import com.servicelink.core.mapper.business.ProUserMapper;
import com.servicelink.core.model.user.User;
import com.servicelink.core.repository.business.ProUserRepository;
import com.servicelink.core.service.business.ProUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/business/pro-user")
public class ProUserController {

    private final ProUserService proUserService;
    private final ProUserRepository proUserRepository;
    private final ProUserMapper proUserMapper;

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
        return proUserRepository.findByUser_Id(user.getId())
                .map(proUserMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}
