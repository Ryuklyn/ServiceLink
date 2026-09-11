package com.servicelink.core.controller.admin;

import com.servicelink.core.dto.response.admin.AdminB2BClientDTO;
import com.servicelink.core.service.admin.AdminB2BService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/b2b")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminB2BController {
    private final AdminB2BService adminB2BService;

    @GetMapping
    public ResponseEntity<List<AdminB2BClientDTO>> listClients() {
        return ResponseEntity.ok(adminB2BService.listClients());
    }
}
