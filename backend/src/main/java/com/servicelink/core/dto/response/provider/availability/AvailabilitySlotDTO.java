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
    private String displayRange;
    private Boolean isAvailable;
//    private String reasonTag;
//    private String reasonNote;
    private String reason;
}