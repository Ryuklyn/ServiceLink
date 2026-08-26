package com.servicelink.core.model.business.job;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "pro_job_billing")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ProJobBilling {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_ticket_id", nullable = false)
    private ProJobTicket jobTicket;

    @Column(name = "estimated_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal estimatedAmount;

    @Column(name = "final_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal finalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private ProPaymentStatus paymentStatus;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "payment_date")
    private Instant paymentDate;

    @Column(name = "invoice_number")
    private String invoiceNumber;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;
}
