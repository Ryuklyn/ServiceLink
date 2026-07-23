package com.servicelink.core.controller.appointment;

import com.servicelink.core.dto.response.appointment.RescheduleTokenBalanceDTO;
import com.servicelink.core.model.user.User;
import com.servicelink.core.service.appointment.RescheduleTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/appointments/reschedule-tokens")
@RequiredArgsConstructor
public class RescheduleTokenController {

    private final RescheduleTokenService tokenService;

    /** GET /api/appointments/reschedule-tokens/me */
    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<RescheduleTokenBalanceDTO> getMyBalance(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(tokenService.getBalance(user.getId()));
    }
}