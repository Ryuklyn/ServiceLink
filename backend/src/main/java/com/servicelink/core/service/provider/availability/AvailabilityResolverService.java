package com.servicelink.core.service.provider.availability;

import com.servicelink.core.dto.response.provider.availability.AvailabilitySlotDTO;
import com.servicelink.core.model.appointment.Appointment;
import com.servicelink.core.model.common.TimeSlot;
import com.servicelink.core.model.provider.availability.AvailabilityException;
import com.servicelink.core.model.provider.availability.ProviderScheduleSettings;
import com.servicelink.core.repository.appointment.AppointmentRepository;
import com.servicelink.core.repository.provider.availability.AvailabilityExceptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AvailabilityResolverService {

    private final ProviderScheduleSettingsService settingsService;
    private final AvailabilityExceptionRepository exceptionRepo;
    private final AppointmentRepository appointmentRepo;

    public List<AvailabilitySlotDTO> resolveRange(Long providerId, LocalDate start, LocalDate end, boolean includeReason) {
        ProviderScheduleSettings settings = settingsService.getOrCreate(providerId);
        List<AvailabilityException> exceptions = exceptionRepo.findOverlapping(providerId, start, end);
        List<Appointment> bookings = appointmentRepo.findActiveBetween(providerId, start, end);

        List<AvailabilitySlotDTO> result = new ArrayList<>();
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            for (TimeSlot period : TimeSlot.values()) {
                result.add(resolveSlot(date, period, settings, exceptions, bookings, includeReason));
            }
        }
        return result;
    }

    private AvailabilitySlotDTO resolveSlot(LocalDate date, TimeSlot period, ProviderScheduleSettings settings,
                                            List<AvailabilityException> exceptions, List<Appointment> bookings,
                                            boolean includeReason) {
        boolean booked = bookings.stream()
                .anyMatch(b -> b.getAppointmentDate().equals(date) && b.getTimeSlot() == period);
        if (booked) return build(date, period, false, includeReason ? "Booked" : null);

        Optional<AvailabilityException> ex = exceptions.stream()
                .filter(e -> !date.isBefore(e.getDateStart()) && !date.isAfter(e.getDateEnd()))
                .filter(e -> e.getPeriod() == null || e.getPeriod() == period)
                .findFirst();
        if (ex.isPresent()) return build(date, period, false, includeReason ? ex.get().getReason() : null);

        int dow = date.getDayOfWeek().getValue() % 7; // Sunday = 0
        boolean active = settings.getWorkingDays().contains(dow) && settings.getDefaultSlots().contains(period);
        return build(date, period, active, null);
    }

    private AvailabilitySlotDTO build(LocalDate date, TimeSlot period, boolean available, String reason) {
        return AvailabilitySlotDTO.builder().date(date).period(period)
                .displayRange(period.getDisplayRange()).isAvailable(available).reason(reason).build();
    }
}
