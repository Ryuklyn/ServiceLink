// com/servicelink/core/controller/appointment/AppointmentRescheduleController.java
package com.servicelink.core.controller.appointment;

import com.servicelink.core.dto.request.appointment.AppointmentPaymentVerifyRequestDTO;
import com.servicelink.core.dto.request.appointment.AppointmentReschedulePaymentInitiateRequestDTO;
import com.servicelink.core.dto.request.appointment.RescheduleRequestDTO;
import com.servicelink.core.dto.response.appointment.AppointmentPaymentInitiateResponseDTO;
import com.servicelink.core.dto.response.appointment.AppointmentResponseDTO;
import com.servicelink.core.model.user.User;
import com.servicelink.core.service.appointment.AppointmentRescheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments/{id}/reschedule")
@RequiredArgsConstructor
public class AppointmentRescheduleController {

    private final AppointmentRescheduleService rescheduleService;

    /**
     * PATCH /api/appointments/{id}/reschedule
     * Free reschedule — only allowed when the booking is more than 24h out.
     */
    @PatchMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<AppointmentResponseDTO> rescheduleFree(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequestDTO req) {

        return ResponseEntity.ok(rescheduleService.rescheduleFree(user.getId(), id, req));
    }

    /**
     * PATCH /api/appointments/{id}/reschedule/token
     * Late reschedule (< 24h) — spends 1 reschedule token, applied immediately.
     */
    @PatchMapping("/token")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<AppointmentResponseDTO> rescheduleWithToken(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequestDTO req) {

        return ResponseEntity.ok(rescheduleService.rescheduleWithToken(user.getId(), id, req));
    }

    /**
     * POST /api/appointments/{id}/reschedule/payment/initiate
     * Late reschedule (< 24h), Rs.50 cash fee — step 1: build the gateway redirect.
     */
    @PostMapping("/payment/initiate")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<AppointmentPaymentInitiateResponseDTO> initiatePayment(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody AppointmentReschedulePaymentInitiateRequestDTO req) throws Exception {

        return ResponseEntity.ok(rescheduleService.initiateReschedulePayment(user.getId(), id, req));
    }

    /**
     * POST /api/appointments/{id}/reschedule/payment/verify
     * Step 2 — confirms with the gateway and, only on success, applies the reschedule.
     */
    @PostMapping("/payment/verify")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<AppointmentResponseDTO> verifyPayment(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody AppointmentPaymentVerifyRequestDTO req) throws Exception {

        return ResponseEntity.ok(rescheduleService.verifyReschedulePayment(user.getId(), id, req));
    }
}