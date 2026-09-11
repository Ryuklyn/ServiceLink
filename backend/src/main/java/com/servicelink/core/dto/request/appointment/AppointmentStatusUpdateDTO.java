package com.servicelink.core.dto.request.appointment;

// com/servicelink/core/dto/request/appointment/AppointmentStatusUpdateDTO.java


import com.servicelink.core.model.appointment.AppointmentStatus;
import com.servicelink.core.model.appointment.AppointmentPaymentMethod;
import com.servicelink.core.model.appointment.AppointmentPaymentStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import jakarta.validation.Valid;
import java.util.List;

@Data
public class AppointmentStatusUpdateDTO {

    @NotNull(message = "Status is required")
    private AppointmentStatus status;

    @Size(max = 1000, message = "Reason must not exceed 1000 characters")
    private String reason;

    private String operationalStatus;

    @Min(value = 0, message = "Final amount cannot be negative")
    private Integer finalAmount;

    private AppointmentPaymentStatus paymentStatus;

    private AppointmentPaymentMethod paymentMethod;

    @Size(max = 1000, message = "Completion note must not exceed 1000 characters")
    private String completionNote;

    @Valid
    private List<ServiceCompletionDTO> completedServices;

    @Data
    public static class ServiceCompletionDTO {
        @NotNull(message = "Service catalog id is required")
        private Long serviceCatalogId;

        @NotNull(message = "Service name is required")
        @Size(max = 255)
        private String subServiceName;

        @NotNull(message = "Final amount is required for every service")
        @Min(value = 0, message = "Service final amount cannot be negative")
        private Integer finalAmount;
    }

    private Integer measuredQuantity;
}
