// com/servicelink/core/dto/request/appointment/AppointmentReschedulePaymentInitiateRequestDTO.java
package com.servicelink.core.dto.request.appointment;

import com.servicelink.core.model.business.PaymentGateway;
import com.servicelink.core.model.common.TimeSlot;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AppointmentReschedulePaymentInitiateRequestDTO {

    @NotNull(message = "New date is required")
    @Future(message = "New date must be in the future")
    private LocalDate newDate;

    @NotNull(message = "New time slot is required")
    private TimeSlot newTimeSlot;

    @Size(max = 1000, message = "Reason must not exceed 1000 characters")
    private String reason;

    @NotNull(message = "Payment gateway is required")
    private PaymentGateway paymentGateway; // ESEWA or KHALTI

    @NotBlank(message = "successUrl is required")
    private String successUrl;

    @NotBlank(message = "failureUrl is required")
    private String failureUrl;
}