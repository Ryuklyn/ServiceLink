package com.servicelink.core.controller.appointment;

import com.servicelink.core.dto.response.appointment.CancellationTokenBalanceDTO;
import com.servicelink.core.model.user.User;
import com.servicelink.core.service.appointment.CancellationTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/appointments/cancellation-tokens")
@RequiredArgsConstructor
public class CancellationTokenController {

    private final CancellationTokenService tokenService;

    /** GET /api/appointments/cancellation-tokens/me */
    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CancellationTokenBalanceDTO> getMyBalance(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(tokenService.getBalance(user.getId()));
    }
}
