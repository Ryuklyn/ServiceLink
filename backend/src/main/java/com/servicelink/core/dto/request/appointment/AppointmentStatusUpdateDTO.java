package com.servicelink.core.dto.request.appointment;

// com/servicelink/core/dto/request/appointment/AppointmentStatusUpdateDTO.java


import com.servicelink.core.model.appointment.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AppointmentStatusUpdateDTO {

    @NotNull(message = "Status is required")
    private AppointmentStatus status;

    @Size(max = 1000, message = "Reason must not exceed 1000 characters")
    private String reason;
}
