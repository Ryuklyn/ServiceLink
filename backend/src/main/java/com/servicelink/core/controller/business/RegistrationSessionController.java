package com.servicelink.core.controller.business;

import com.servicelink.core.dto.cache.business.RegistrationSession;
import com.servicelink.core.service.business.BusinessRegistrationSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/business/registration")
public class RegistrationSessionController {
    private final BusinessRegistrationSessionService sessionService;

    @GetMapping("/resume/{organizationId}")
    public ResponseEntity<RegistrationSession> resume(@PathVariable Long organizationId) {
        return sessionService.getSession(organizationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
