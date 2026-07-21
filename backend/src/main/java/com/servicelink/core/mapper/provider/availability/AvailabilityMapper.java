package com.servicelink.core.mapper.provider.availability;


import com.servicelink.core.dto.response.provider.availability.AvailabilitySlotDTO;
import com.servicelink.core.model.provider.availability.ProviderAvailabilitySlot;
import org.springframework.stereotype.Component;

@Component
public class AvailabilityMapper {

    /** Owner-facing — includes reason. */
    public AvailabilitySlotDTO toOwnerDto(ProviderAvailabilitySlot slot) {
        return AvailabilitySlotDTO.builder()
                .date(slot.getDate())
                .period(slot.getPeriod())
                .displayRange(slot.getPeriod().getDisplayRange())
                .isAvailable(slot.getIsAvailable())
                .reason(slot.getReason())
                .build();
    }

    /** Public/customer-facing — reason deliberately omitted. */
    public AvailabilitySlotDTO toPublicDto(ProviderAvailabilitySlot slot) {
        return AvailabilitySlotDTO.builder()
                .date(slot.getDate())
                .period(slot.getPeriod())
                .displayRange(slot.getPeriod().getDisplayRange())
                .isAvailable(slot.getIsAvailable())
                .build();
    }
}