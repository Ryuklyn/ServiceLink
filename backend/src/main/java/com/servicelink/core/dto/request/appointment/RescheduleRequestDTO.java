package com.servicelink.core.dto.request.appointment;

// com/servicelink/core/dto/request/appointment/RescheduleRequestDTO.java

import com.servicelink.core.model.common.TimeSlot;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RescheduleRequestDTO {

    @NotNull(message = "New date is required")
    @Future(message = "New date must be in the future")
    private LocalDate newDate;

    @NotNull(message = "New time slot is required")
    private TimeSlot newTimeSlot;

    @Size(max = 1000, message = "Reason must not exceed 1000 characters")
    private String reason;
}