package com.servicelink.core.dto.response.provider.availability;

import com.servicelink.core.model.common.TimeSlot;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class AvailabilitySlotDTO {
    private LocalDate date;
    private TimeSlot period;
    private String displayRange;   // TimeSlot.getDisplayRange(), e.g. "08:00-12:00"
    private Boolean isAvailable;
    private String reason;         // always null on the public/customer response
}
