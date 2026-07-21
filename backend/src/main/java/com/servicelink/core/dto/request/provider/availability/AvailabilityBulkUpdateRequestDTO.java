package com.servicelink.core.dto.request.provider.availability;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class AvailabilityBulkUpdateRequestDTO {

    @NotEmpty(message = "updates must contain at least one entry")
    @Valid
    private List<AvailabilitySlotUpdateDTO> updates;
}
