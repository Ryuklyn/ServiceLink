package com.servicelink.core.service.appointment;

import com.servicelink.core.dto.request.appointment.AppointmentPaymentVerifyRequestDTO;
import com.servicelink.core.dto.request.appointment.AppointmentReschedulePaymentInitiateRequestDTO;
import com.servicelink.core.dto.response.appointment.AppointmentPaymentInitiateResponseDTO;
import com.servicelink.core.dto.response.appointment.AppointmentResponseDTO;
import com.servicelink.core.exception.BusinessException;
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
import com.servicelink.core.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Year;
import java.util.Map;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentCancellationService {

    private static final long LATE_WINDOW_HOURS = 24L;
    private static final long LATE_CANCELLATION_FEE_NPR = 100L;

    private final AppointmentRepository appointmentRepo;
    private final AppointmentMapper appointmentMapper;
    private final AppointmentPaymentTransactionRepository paymentTxRepo;
    private final CancellationTokenService tokenService;
    private final EsewaGatewayService esewaService;
    private final KhaltiGatewayService khaltiService;
    private final UserRepository userRepo;
    private final NotificationService notificationService;

    // ─────────────────────────────────────────────────────────────────────────
    // FREE CANCELLATION
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public AppointmentResponseDTO cancelFree(Long customerId, Long appointmentId, String reason) {
        Appointment appt = getOwnedAppointment(customerId, appointmentId);
        assertCancellable(appt);

        if (isLateWindow(appt)) {
            throw new BusinessException(
                    "This booking is within 24 hours — use a cancellation token or pay the late fee instead",
                    "LATE_CANCELLATION_REQUIRES_PAYMENT");
        }

        applyCancellation(appt, customerId, reason);

        log.info("Appointment {} freely cancelled by customer {}", appointmentId, customerId);
        return toResponse(appt, customerId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LATE CANCELLATION — spend 1 token
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public AppointmentResponseDTO cancelWithToken(Long customerId, Long appointmentId, String reason) {
        Appointment appt = getOwnedAppointment(customerId, appointmentId);
        assertCancellable(appt);

        if (!isLateWindow(appt)) {
            throw new BusinessException(
                    "This booking is outside the late window — cancel for free instead",
                    "NOT_IN_LATE_WINDOW");
        }

        tokenService.useToken(customerId);

        applyCancellation(appt, customerId, reason);

        log.info("Appointment {} cancelled by customer {} using 1 cancellation token", appointmentId, customerId);
        return toResponse(appt, customerId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LATE CANCELLATION — Rs. 100 fee step 1: initiate payment
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public AppointmentPaymentInitiateResponseDTO initiateCancellationPayment(
            Long customerId, Long appointmentId, AppointmentReschedulePaymentInitiateRequestDTO req) throws Exception {

        Appointment appt = getOwnedAppointment(customerId, appointmentId);
        assertCancellable(appt);

        if (!isLateWindow(appt)) {
            throw new BusinessException(
                    "This booking is outside the late window — cancel for free instead",
                    "NOT_IN_LATE_WINDOW");
        }

        String referenceId = "SLC-" + Year.now().getValue() + "-"
                + String.format("%06d", new Random().nextInt(999999));

        log.info("Initiating cancellation-fee payment: ref={} appointment={} gateway={} amountNpr={}",
                referenceId, appointmentId, req.getPaymentGateway(), LATE_CANCELLATION_FEE_NPR);

        String gatewayRedirectUrl;
        String gatewayMethod = "GET";
        Map<String, String> gatewayFormFields = null;
        String pidx = null;

        switch (req.getPaymentGateway()) {
            case ESEWA -> {
                EsewaGatewayService.EsewaPaymentForm form = esewaService.buildPaymentForm(
                        referenceId, LATE_CANCELLATION_FEE_NPR, req.getSuccessUrl(), req.getFailureUrl());
                gatewayRedirectUrl = form.actionUrl();
                gatewayMethod = "POST";
                gatewayFormFields = form.fields();
            }
            case KHALTI -> {
                long amountPaisa = LATE_CANCELLATION_FEE_NPR * 100L;
                KhaltiGatewayService.KhaltiInitiateResult result = khaltiService.initiatePayment(
                        referenceId, amountPaisa,
                        "Cancellation fee — booking #" + appointmentId,
                        req.getSuccessUrl());
                pidx = result.pidx();
                gatewayRedirectUrl = result.paymentUrl();
            }
            default -> throw new BusinessException(
                    "Unsupported gateway for cancellation fee: " + req.getPaymentGateway(), "INVALID_GATEWAY");
        }

        AppointmentPaymentTransaction tx = AppointmentPaymentTransaction.builder()
                .appointment(appt)
                .referenceId(referenceId)
                .purpose(AppointmentPaymentPurpose.CANCEL_FEE)
                .paymentGateway(req.getPaymentGateway())
                .paymentStatus(PaymentStatus.INITIATED)
                .amountNpr(LATE_CANCELLATION_FEE_NPR)
                .gatewayRedirectUrl(gatewayRedirectUrl)
                .gatewayTransactionId(pidx)
                .pendingReason(req.getReason())
                .build();

        paymentTxRepo.save(tx);

        return AppointmentPaymentInitiateResponseDTO.builder()
                .referenceId(referenceId)
                .gatewayRedirectUrl(gatewayRedirectUrl)
                .gatewayMethod(gatewayMethod)
                .gatewayFormFields(gatewayFormFields)
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LATE CANCELLATION — Rs. 100 fee step 2: verify payment
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public AppointmentResponseDTO verifyCancellationPayment(
            Long customerId, Long appointmentId, AppointmentPaymentVerifyRequestDTO req) throws Exception {

        Appointment appt = getOwnedAppointment(customerId, appointmentId);
        assertCancellable(appt);

        AppointmentPaymentTransaction tx = paymentTxRepo.findByReferenceId(req.getReferenceId())
                .orElseThrow(() -> new ResourceNotFoundException("PaymentTransaction", req.getReferenceId()));

        if (!tx.getAppointment().getId().equals(appointmentId)) {
            throw new BusinessException(
                    "Transaction does not belong to this appointment", "TRANSACTION_MISMATCH");
        }

        if (tx.getPaymentStatus() == PaymentStatus.SUCCESS) {
            log.info("Cancellation payment ref={} already successful. Re-returning appointment.", req.getReferenceId());
            return toResponse(appt, customerId);
        }

        boolean verified = switch (tx.getPaymentGateway()) {
            case ESEWA -> esewaService.verifyPayment(
                    tx.getReferenceId(), tx.getAmountNpr(), req.getGatewayResponseData());
            case KHALTI -> khaltiService.verifyPayment(
                    tx.getGatewayTransactionId(), tx.getAmountNpr() * 100L);
            case BANK_TRANSFER -> throw new BusinessException(
                    "Bank transfer is not supported for cancellation fees", "INVALID_GATEWAY");
        };

        if (!verified) {
            tx.setPaymentStatus(PaymentStatus.FAILED);
            paymentTxRepo.save(tx);
            throw new BusinessException("Gateway payment verification failed", "PAYMENT_VERIFICATION_FAILED");
        }

        tx.setPaymentStatus(PaymentStatus.SUCCESS);
        if (req.getGatewayTransactionId() != null && !req.getGatewayTransactionId().isBlank()) {
            tx.setGatewayTransactionId(req.getGatewayTransactionId());
        }
        tx.setGatewayResponse(req.getGatewayResponseData());
        tx.setCompletedAt(LocalDateTime.now());
        paymentTxRepo.save(tx);

        applyCancellation(appt, customerId, tx.getPendingReason());

        log.info("Late cancellation fee payment success: ref={} appointment={} customer={}",
                tx.getReferenceId(), appointmentId, customerId);

        return toResponse(appt, customerId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE DOMAIN HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private Appointment getOwnedAppointment(Long customerId, Long appointmentId) {
        Appointment appt = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", appointmentId));
        if (!appt.isOwnedByCustomer(customerId)) {
            throw new BusinessException("You do not own this appointment", "ACCESS_DENIED");
        }
        return appt;
    }

    private void assertCancellable(Appointment appt) {
        if (appt.getStatus() == AppointmentStatus.CANCELLED || appt.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BusinessException("Cannot cancel a completed or already cancelled booking", "INVALID_STATUS");
        }
    }

    private boolean isLateWindow(Appointment appt) {
        if (appt.getStatus() != AppointmentStatus.CONFIRMED) {
            return false;
        }
        LocalDate date = appt.getAppointmentDate();
        LocalTime time = appt.getTimeSlot().getStartTime();
        LocalDateTime apptDateTime = LocalDateTime.of(date, time);
        return LocalDateTime.now().plusHours(LATE_WINDOW_HOURS).isAfter(apptDateTime);
    }

    private void applyCancellation(Appointment appt, Long customerId, String reason) {
        appt.setStatus(AppointmentStatus.CANCELLED);
        appt.setCancelledAt(LocalDateTime.now());
        appt.setCancelledBy(customerId);
        appt.setCancellationReason(reason);
        appointmentRepo.save(appt);

        // 🔔 NOTIFY PROVIDER
        try {
            notificationService.sendPrivateNotification(
                    appt.getProvider().getUser().getId(),
                    com.servicelink.core.model.user.Role.PROVIDER,
                    com.servicelink.core.model.notification.NotificationCategory.BOOKING,
                    "Booking Cancelled",
                    "Customer has cancelled booking (BK-" + appt.getId() + "). Reason: " + (reason != null ? reason : "None specified"),
                    "/dashboard/provider/bookings"
            );
        } catch (Exception e) {
            log.error("Failed to send cancellation notification to provider", e);
        }
    }

    private AppointmentResponseDTO toResponse(Appointment appt, Long customerId) {
        User customer = userRepo.findById(customerId).orElse(null);
        return appointmentMapper.toResponseDTO(appt, null, customer);
    }
}
