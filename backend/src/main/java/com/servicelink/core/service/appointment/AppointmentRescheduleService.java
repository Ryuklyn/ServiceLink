package com.servicelink.core.service.appointment;

import com.servicelink.core.dto.request.appointment.AppointmentPaymentVerifyRequestDTO;
import com.servicelink.core.dto.request.appointment.AppointmentReschedulePaymentInitiateRequestDTO;
import com.servicelink.core.dto.request.appointment.RescheduleRequestDTO;
import com.servicelink.core.dto.response.appointment.AppointmentPaymentInitiateResponseDTO;
import com.servicelink.core.dto.response.appointment.AppointmentResponseDTO;
import com.servicelink.core.exception.BusinessException;
import com.servicelink.core.exception.ConflictException;
import com.servicelink.core.exception.ResourceNotFoundException;
import com.servicelink.core.mapper.appointment.AppointmentMapper;
import com.servicelink.core.model.appointment.Appointment;
import com.servicelink.core.model.appointment.AppointmentPaymentPurpose;
import com.servicelink.core.model.appointment.AppointmentPaymentTransaction;
import com.servicelink.core.model.appointment.AppointmentStatus;
import com.servicelink.core.model.business.PaymentGateway;
import com.servicelink.core.model.business.PaymentStatus;
import com.servicelink.core.model.common.TimeSlot;
import com.servicelink.core.model.user.User;
import com.servicelink.core.payment.gateway.EsewaGatewayService;
import com.servicelink.core.payment.gateway.KhaltiGatewayService;
import com.servicelink.core.repository.UserRepository;
import com.servicelink.core.repository.appointment.AppointmentPaymentTransactionRepository;
import com.servicelink.core.repository.appointment.AppointmentRepository;
import com.servicelink.core.repository.appointment.ProviderServiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Year;
import java.util.Map;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentRescheduleService {

    /** Flat late-reschedule fee in NPR — matches the Rs. 50 shown in the booking UI. */
    private static final long LATE_RESCHEDULE_FEE_NPR = 50L;

    /** Anything inside this many hours of the appointment start counts as "late". */
    private static final long LATE_WINDOW_HOURS = 24L;

    private final AppointmentRepository appointmentRepo;
    private final AppointmentMapper appointmentMapper;
    private final AppointmentPaymentTransactionRepository paymentTxRepo;
    private final RescheduleTokenService tokenService;
    private final EsewaGatewayService esewaService;
    private final KhaltiGatewayService khaltiService;
    private final UserRepository userRepo;
    private final ProviderServiceRepository providerServiceRepo;

    // ─────────────────────────────────────────────────────────────────────────
    // FREE RESCHEDULE — only when > 24h out, no token/fee involved
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public AppointmentResponseDTO rescheduleFree(Long customerId, Long appointmentId, RescheduleRequestDTO req) {
        Appointment appt = getOwnedAppointment(customerId, appointmentId);
        assertReschedulable(appt);

        if (isLateWindow(appt)) {
            throw new BusinessException(
                    "This booking is within 24 hours \u2014 use a reschedule token or pay the late fee instead",
                    "LATE_RESCHEDULE_REQUIRES_PAYMENT");
        }

        assertSlotAvailable(appt, req.getNewDate(), req.getNewTimeSlot());
        applyReschedule(appt, req.getNewDate(), req.getNewTimeSlot(), req.getReason());

        log.info("Appointment {} freely rescheduled by customer {}", appointmentId, customerId);
        return toResponse(appt, customerId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LATE RESCHEDULE — spend 1 token, applied immediately
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public AppointmentResponseDTO rescheduleWithToken(Long customerId, Long appointmentId, RescheduleRequestDTO req) {
        Appointment appt = getOwnedAppointment(customerId, appointmentId);
        assertReschedulable(appt);

        if (!isLateWindow(appt)) {
            throw new BusinessException(
                    "This booking is outside the late window \u2014 reschedule for free instead",
                    "NOT_IN_LATE_WINDOW");
        }

        assertSlotAvailable(appt, req.getNewDate(), req.getNewTimeSlot());

        // Throws NO_TOKENS_REMAINING if balance is 0 — nothing else mutates until this succeeds.
        tokenService.useToken(customerId);

        applyReschedule(appt, req.getNewDate(), req.getNewTimeSlot(), req.getReason());

        log.info("Appointment {} rescheduled by customer {} using 1 reschedule token", appointmentId, customerId);
        return toResponse(appt, customerId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LATE RESCHEDULE — Rs.50 cash fee, step 1: initiate gateway payment
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public AppointmentPaymentInitiateResponseDTO initiateReschedulePayment(
            Long customerId, Long appointmentId, AppointmentReschedulePaymentInitiateRequestDTO req) throws Exception {

        Appointment appt = getOwnedAppointment(customerId, appointmentId);
        assertReschedulable(appt);

        if (!isLateWindow(appt)) {
            throw new BusinessException(
                    "This booking is outside the late window \u2014 reschedule for free instead",
                    "NOT_IN_LATE_WINDOW");
        }

        assertSlotAvailable(appt, req.getNewDate(), req.getNewTimeSlot());

        String referenceId = "SLR-" + Year.now().getValue() + "-"
                + String.format("%06d", new Random().nextInt(999999));

        log.info("Initiating reschedule-fee payment: ref={} appointment={} gateway={} amountNpr={}",
                referenceId, appointmentId, req.getPaymentGateway(), LATE_RESCHEDULE_FEE_NPR);

        String gatewayRedirectUrl;
        String gatewayMethod = "GET";
        Map<String, String> gatewayFormFields = null;
        String pidx = null;

        switch (req.getPaymentGateway()) {
            case ESEWA -> {
                EsewaGatewayService.EsewaPaymentForm form = esewaService.buildPaymentForm(
                        referenceId, LATE_RESCHEDULE_FEE_NPR, req.getSuccessUrl(), req.getFailureUrl());
                gatewayRedirectUrl = form.actionUrl();
                gatewayMethod = "POST";
                gatewayFormFields = form.fields();
            }
            case KHALTI -> {
                long amountPaisa = LATE_RESCHEDULE_FEE_NPR * 100L;
                KhaltiGatewayService.KhaltiInitiateResult result = khaltiService.initiatePayment(
                        referenceId, amountPaisa,
                        "Reschedule fee \u2014 booking #" + appointmentId,
                        req.getSuccessUrl());
                pidx = result.pidx();
                gatewayRedirectUrl = result.paymentUrl();
            }
            default -> throw new BusinessException(
                    "Unsupported gateway for reschedule fee: " + req.getPaymentGateway(), "INVALID_GATEWAY");
        }

        AppointmentPaymentTransaction tx = AppointmentPaymentTransaction.builder()
                .appointment(appt)
                .referenceId(referenceId)
                .purpose(AppointmentPaymentPurpose.RESCHEDULE_FEE)
                .paymentGateway(req.getPaymentGateway())
                .paymentStatus(PaymentStatus.INITIATED)
                .amountNpr(LATE_RESCHEDULE_FEE_NPR)
                .gatewayRedirectUrl(gatewayRedirectUrl)
                .gatewayTransactionId(pidx)
                .pendingDate(req.getNewDate())
                .pendingTimeSlot(req.getNewTimeSlot())
                .pendingReason(req.getReason())
                .build();

        paymentTxRepo.save(tx);

        return AppointmentPaymentInitiateResponseDTO.builder()
                .referenceId(referenceId)
                .gatewayRedirectUrl(gatewayRedirectUrl)
                .gatewayMethod(gatewayMethod)
                .gatewayFormFields(gatewayFormFields)
                .gateway(req.getPaymentGateway().name())
                .status(PaymentStatus.INITIATED.name())
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LATE RESCHEDULE — Rs.50 cash fee, step 2: verify with gateway, then apply
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public AppointmentResponseDTO verifyReschedulePayment(
            Long customerId, Long appointmentId, AppointmentPaymentVerifyRequestDTO req) throws Exception {

        Appointment appt = getOwnedAppointment(customerId, appointmentId);

        AppointmentPaymentTransaction tx = paymentTxRepo.findByReferenceId(req.getReferenceId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment transaction", req.getReferenceId()));

        if (!tx.getAppointment().getId().equals(appointmentId)) {
            throw new BusinessException(
                    "Transaction does not belong to this appointment", "TRANSACTION_MISMATCH");
        }

        if (tx.getPaymentStatus() == PaymentStatus.SUCCESS) {
            log.warn("Reschedule payment already verified, skipping re-apply: ref={}", tx.getReferenceId());
            return toResponse(appt, customerId);
        }

        boolean verified = switch (tx.getPaymentGateway()) {
            case ESEWA -> esewaService.verifyPayment(
                    tx.getReferenceId(), tx.getAmountNpr(), req.getGatewayResponseData());
            case KHALTI -> khaltiService.verifyPayment(
                    tx.getGatewayTransactionId(), tx.getAmountNpr() * 100L);
            case BANK_TRANSFER -> throw new BusinessException(
                    "Bank transfer is not supported for reschedule fees", "INVALID_GATEWAY");
        };

        if (!verified) {
            tx.setPaymentStatus(PaymentStatus.FAILED);
            paymentTxRepo.save(tx);
            log.warn("Reschedule-fee payment verification FAILED: ref={}", tx.getReferenceId());
            throw new BusinessException(
                    "Payment verification failed \u2014 the booking was not rescheduled",
                    "PAYMENT_VERIFICATION_FAILED");
        }

        // Re-check the slot right before applying — it may have filled while payment was in flight.
        assertSlotAvailable(appt, tx.getPendingDate(), tx.getPendingTimeSlot());

        tx.setPaymentStatus(PaymentStatus.SUCCESS);
        if (req.getGatewayTransactionId() != null && !req.getGatewayTransactionId().isBlank()) {
            tx.setGatewayTransactionId(req.getGatewayTransactionId());
        }
        tx.setGatewayResponse(req.getGatewayResponseData());
        tx.setCompletedAt(LocalDateTime.now());
        paymentTxRepo.save(tx);

        applyReschedule(appt, tx.getPendingDate(), tx.getPendingTimeSlot(), tx.getPendingReason());

        log.info("Appointment {} rescheduled after Rs.{} fee payment: ref={}",
                appointmentId, tx.getAmountNpr(), tx.getReferenceId());
        return toResponse(appt, customerId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SHARED HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private Appointment getOwnedAppointment(Long customerId, Long appointmentId) {
        return appointmentRepo.findByIdAndCustomerId(appointmentId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", appointmentId));
    }

    private void assertReschedulable(Appointment appt) {
        if (appt.getStatus() != AppointmentStatus.PENDING && appt.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new BusinessException(
                    "Only PENDING or CONFIRMED appointments can be rescheduled (current status: "
                            + appt.getStatus() + ")",
                    "NOT_RESCHEDULABLE");
        }
    }

    private boolean isLateWindow(Appointment appt) {
        LocalTime startTime = appt.getEstimatedStartTime() != null
                ? appt.getEstimatedStartTime()
                : appt.getTimeSlot().getStartTime();
        LocalDateTime apptDateTime = LocalDateTime.of(appt.getAppointmentDate(), startTime);
        return Duration.between(LocalDateTime.now(), apptDateTime).toHours() < LATE_WINDOW_HOURS;
    }

    private void assertSlotAvailable(Appointment appt, LocalDate newDate, TimeSlot newSlot) {
        boolean taken = appointmentRepo.isSlotTakenExcluding(
                appt.getProvider().getId(), newDate, newSlot, appt.getId());
        if (taken) {
            throw new ConflictException(
                    "The " + newSlot.getDisplayLabel() + " slot on " + newDate
                            + " is already booked for this provider",
                    "APPOINTMENT_SLOT_TAKEN");
        }
    }

    private void applyReschedule(Appointment appt, LocalDate newDate, TimeSlot newSlot, String reason) {
        appt.setAppointmentDate(newDate);
        appt.setTimeSlot(newSlot);
        appt.setEstimatedStartTime(newSlot.getStartTime());
        appt.setEstimatedEndTime(newSlot.getEndTime());
        if (reason != null && !reason.isBlank()) {
            appt.setNotes(appendReason(appt.getNotes(), reason));
        }
        // Rescheduled bookings drop back to PENDING so the provider reconfirms the new slot.
        // If you'd rather keep it CONFIRMED automatically, remove these two lines.
        appt.setStatus(AppointmentStatus.PENDING);
        appt.setConfirmedAt(null);
        appointmentRepo.save(appt);
    }

    private String appendReason(String existingNotes, String rescheduleReason) {
        String tag = "[Rescheduled] " + rescheduleReason;
        return (existingNotes == null || existingNotes.isBlank()) ? tag : existingNotes + "\n" + tag;
    }

    private AppointmentResponseDTO toResponse(Appointment appt, Long customerId) {
        var providerService = providerServiceRepo
                .findAvailableByProviderAndCatalog(appt.getProvider().getId(), appt.getServiceCatalog().getId())
                .orElse(null);
        User customer = userRepo.findById(customerId).orElse(null);
        return appointmentMapper.toResponseDTO(appt, providerService, customer);
    }
}