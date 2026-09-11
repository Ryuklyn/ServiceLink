package com.servicelink.core.controller.appointment;

import com.servicelink.core.dto.request.appointment.AppointmentPaymentVerifyRequestDTO;
import com.servicelink.core.dto.request.appointment.AppointmentReschedulePaymentInitiateRequestDTO;
import com.servicelink.core.dto.response.appointment.AppointmentPaymentInitiateResponseDTO;
import com.servicelink.core.dto.response.appointment.AppointmentResponseDTO;
import com.servicelink.core.model.user.User;
import com.servicelink.core.service.appointment.AppointmentCancellationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments/{id}/cancel")
@RequiredArgsConstructor
public class AppointmentCancellationController {

    private final AppointmentCancellationService cancellationService;

    /**
     * PATCH /api/appointments/{id}/cancel
     * Free cancellation — allowed when booking is outside 24h or PENDING.
     */
    @PatchMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<AppointmentResponseDTO> cancelFree(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {

        return ResponseEntity.ok(cancellationService.cancelFree(user.getId(), id, reason));
    }

    /**
     * PATCH /api/appointments/{id}/cancel/token
     * Late cancellation (< 24h) — spends 1 cancellation token, applied immediately.
     */
    @PatchMapping("/token")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<AppointmentResponseDTO> cancelWithToken(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {

        return ResponseEntity.ok(cancellationService.cancelWithToken(user.getId(), id, reason));
    }

    /**
     * POST /api/appointments/{id}/cancel/payment/initiate
     * Late cancellation (< 24h), Rs.100 cash fee — step 1: build the gateway redirect.
     */
    @PostMapping("/payment/initiate")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<AppointmentPaymentInitiateResponseDTO> initiatePayment(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody AppointmentReschedulePaymentInitiateRequestDTO req) throws Exception {

        return ResponseEntity.ok(cancellationService.initiateCancellationPayment(user.getId(), id, req));
    }

    /**
     * POST /api/appointments/{id}/cancel/payment/verify
     * Step 2 — confirms with the gateway and applies the cancellation on success.
     */
    @PostMapping("/payment/verify")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<AppointmentResponseDTO> verifyPayment(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody AppointmentPaymentVerifyRequestDTO req) throws Exception {

        return ResponseEntity.ok(cancellationService.verifyCancellationPayment(user.getId(), id, req));
    }
}
