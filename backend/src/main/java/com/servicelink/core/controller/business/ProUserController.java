package com.servicelink.core.controller.business;

import com.servicelink.core.dto.request.business.ProUserRequest;
import com.servicelink.core.dto.response.business.ProUserResponse;
import com.servicelink.core.service.business.ProUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/business/pro-user")
public class ProUserController {

    private final ProUserService proUserService;

    @PostMapping("/create")
    public ResponseEntity<ProUserResponse> create(@Valid @RequestBody ProUserRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(proUserService.create(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
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
}
