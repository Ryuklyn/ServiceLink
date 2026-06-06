// com/servicelink/core/controller/appointment/AppointmentController.java
package com.servicelink.core.controller.appointment;

import com.servicelink.core.dto.request.appointment.AppointmentRequestDTO;
import com.servicelink.core.dto.request.appointment.AppointmentStatusUpdateDTO;
import com.servicelink.core.dto.response.appointment.AppointmentResponseDTO;
import com.servicelink.core.dto.response.appointment.AppointmentStatsDTO;
import com.servicelink.core.dto.response.appointment.AppointmentSummaryDTO;
import com.servicelink.core.model.appointment.AppointmentStatus;
import com.servicelink.core.model.user.User;
import com.servicelink.core.service.appointment.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    // ─────────────────────────────────────────────────────────────────────────
    // CUSTOMER ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/v1/appointments
     * Book a new appointment.
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<AppointmentResponseDTO> book(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AppointmentRequestDTO req) {

        AppointmentResponseDTO response = appointmentService.book(user.getId(), req);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/v1/appointments?status=PENDING&page=0&size=10
     * Paged appointment history for the authenticated customer.
     * Optionally filter by status.
     */
    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Page<AppointmentSummaryDTO>> getMyAppointments(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("appointmentDate").descending());
        return ResponseEntity.ok(appointmentService.getMyAppointments(user.getId(), status, pageable));
    }

    /**
     * GET /api/v1/appointments/{id}
     * Full detail for a single appointment owned by the customer.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<AppointmentResponseDTO> getMyAppointmentDetail(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {

        return ResponseEntity.ok(appointmentService.getMyAppointmentDetail(user.getId(), id));
    }

    /**
     * PATCH /api/v1/appointments/{id}/cancel
     * Customer cancels their own appointment.
     */
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<AppointmentResponseDTO> cancelMyAppointment(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {

        return ResponseEntity.ok(appointmentService.cancelByCustomer(user.getId(), id, reason));
    }

    /**
     * GET /api/v1/appointments/stats
     * Appointment counts by status for the customer's dashboard widgets.
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<AppointmentStatsDTO> getMyStats(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(appointmentService.getCustomerStats(user.getId()));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PROVIDER ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/v1/appointments/provider?status=CONFIRMED&page=0&size=10
     * Paged job list for the authenticated provider.
     */
    @GetMapping("/provider")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Page<AppointmentSummaryDTO>> getMyJobs(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("appointmentDate").descending());
        return ResponseEntity.ok(
                appointmentService.getProviderAppointments(user.getId(), status, pageable));
    }

    /**
     * GET /api/v1/appointments/provider/{id}
     * Full detail for a single appointment assigned to the provider.
     */
    @GetMapping("/provider/{id}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<AppointmentResponseDTO> getMyJobDetail(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {

        return ResponseEntity.ok(appointmentService.getProviderAppointmentDetail(user.getId(), id));
    }

    /**
     * PATCH /api/v1/appointments/provider/{id}/status
     * Provider advances or cancels an appointment.
     *
     * Allowed transitions:
     *   PENDING     -> CONFIRMED
     *   CONFIRMED   -> IN_PROGRESS
     *   IN_PROGRESS -> COMPLETED
     *   Any active  -> CANCELLED
     */
    @PatchMapping("/provider/{id}/status")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<AppointmentResponseDTO> updateJobStatus(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody AppointmentStatusUpdateDTO req) {

        return ResponseEntity.ok(
                appointmentService.updateStatusByProvider(user.getId(), id, req));
    }

    /**
     * GET /api/v1/appointments/provider/upcoming
     * Next jobs queue — PENDING and CONFIRMED, ordered by date/time ascending.
     * Used for the provider home screen.
     */
    @GetMapping("/provider/upcoming")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<AppointmentSummaryDTO>> getUpcomingJobs(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(appointmentService.getProviderUpcomingJobs(user.getId()));
    }

    /**
     * GET /api/v1/appointments/provider/calendar?date=2025-07-01
     * Full-day calendar view — all appointments on a given date.
     */
    @GetMapping("/provider/calendar")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<AppointmentSummaryDTO>> getDayView(
            @AuthenticationPrincipal User user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return ResponseEntity.ok(appointmentService.getProviderDayView(user.getId(), date));
    }

    /**
     * GET /api/v1/appointments/provider/stats
     * Job counts by status for provider dashboard widgets.
     */
    @GetMapping("/provider/stats")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<AppointmentStatsDTO> getProviderStats(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(appointmentService.getProviderStats(user.getId()));
    }
}
