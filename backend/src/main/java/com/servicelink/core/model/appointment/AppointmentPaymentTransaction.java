package com.servicelink.core.model.appointment;

// com/servicelink/core/model/appointment/AppointmentPaymentTransaction.java

import com.servicelink.core.model.business.PaymentGateway;
import com.servicelink.core.model.business.PaymentStatus;
import com.servicelink.core.model.common.TimeSlot;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Payment record for appointment-side fees (late reschedule, late cancel) —
 * deliberately a separate table from PaymentTransaction, which is scoped to
 * ProviderSubscription billing and shouldn't be overloaded with a different
 * FK/lifecycle. Reuses EsewaGatewayService / KhaltiGatewayService directly;
 * no gateway-level duplication.
 *
 * pendingDate / pendingTimeSlot / pendingReason hold the requested new
 * date/slot for a RESCHEDULE_FEE transaction between initiate() and verify()
 * — the actual Appointment row is only mutated once the gateway confirms
 * SUCCESS, so a failed/abandoned payment never touches the booking.
 */
@Entity
@Table(
        name = "appointment_payment_transactions",
        indexes = {
                @Index(name = "idx_appt_pay_appointment_id", columnList = "appointment_id"),
                @Index(name = "idx_appt_pay_reference_id",   columnList = "reference_id"),
                @Index(name = "idx_appt_pay_status",         columnList = "payment_status")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentPaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false)
    private com.servicelink.core.model.appointment.Appointment appointment;

    @Column(name = "reference_id", nullable = false, unique = true, length = 64)
    private String referenceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "purpose", nullable = false, length = 30)
    private AppointmentPaymentPurpose purpose;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_gateway", nullable = false, length = 20)
    private PaymentGateway paymentGateway;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.INITIATED;

    @Column(name = "amount_npr", nullable = false)
    private long amountNpr;

    @Column(name = "gateway_redirect_url", length = 2048)
    private String gatewayRedirectUrl;

    @Column(name = "gateway_transaction_id")
    private String gatewayTransactionId;

    @Column(name = "gateway_response", columnDefinition = "TEXT")
    private String gatewayResponse;

    // ── Pending change — applied to the Appointment only after verify() succeeds ──
    @Column(name = "pending_date")
    private LocalDate pendingDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "pending_time_slot", length = 20)
    private TimeSlot pendingTimeSlot;

    @Column(name = "pending_reason", columnDefinition = "TEXT")
    private String pendingReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        if (this.paymentStatus == null) this.paymentStatus = PaymentStatus.INITIATED;
    }
}
