package com.servicelink.core.dto.request.provider.availability;

import com.servicelink.core.model.common.TimeSlot;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AvailabilitySlotUpdateDTO {

    @NotNull(message = "date is required")
    private LocalDate date;

    @NotNull(message = "period is required")
    private TimeSlot period;

    @JsonProperty("isAvailable")
    private boolean isAvailable;

    /** Ignored when isAvailable = true; service nulls it out regardless of what's sent. */
    private String reason;
}
