package com.servicelink.core.service.provider.availability;

import com.servicelink.core.exception.BookingConflictException;
import com.servicelink.core.model.common.TimeSlot;
import com.servicelink.core.model.notification.NotificationCategory;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.provider.availability.AvailabilityException;
import com.servicelink.core.model.user.Role;
import com.servicelink.core.repository.appointment.AppointmentRepository;
import com.servicelink.core.repository.provider.ProviderRepository;
import com.servicelink.core.repository.provider.availability.AvailabilityExceptionRepository;
import com.servicelink.core.service.notification.NotificationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AvailabilityExceptionService {

    private final AvailabilityExceptionRepository exceptionRepo;
    private final AppointmentRepository appointmentRepo;
    private final ProviderRepository providerRepo;
    private final NotificationService notificationService;

    @Transactional
    public void createException(Long userId, LocalDate date, TimeSlot period, String reason) {
        Provider provider = requireProvider(userId);

        if (appointmentRepo.existsActiveBooking(provider.getId(), date, period)) {
            throw new BookingConflictException(
                    "You have an active booking in this slot! Complete or reschedule it before turning this off.");
        }

        AvailabilityException ex = exceptionRepo
                .findFirstByProvider_IdAndDateStartAndDateEndAndPeriod(
                        provider.getId(), date, date, period)
                .orElseGet(() -> AvailabilityException.builder()
                        .provider(provider)
                        .dateStart(date)
                        .dateEnd(date)
                        .period(period)
                        .createdAt(Instant.now())
                        .build());
        ex.setReason((reason == null || reason.isBlank()) ? "Not available" : reason);
        exceptionRepo.save(ex);

        notificationService.sendPrivateNotification(
                provider.getUser().getId(),
                Role.PROVIDER,
                NotificationCategory.BOOKING,
                "Availability updated",
                "Marked unavailable on " + date + " (" + period.name().toLowerCase() + ").",
                null
        );
    }

    @Transactional
    public void deleteCoveringException(Long userId, LocalDate date, TimeSlot period) {
        Provider provider = requireProvider(userId);
        exceptionRepo.findOverlapping(provider.getId(), date, date).stream()
                .filter(e -> e.getPeriod() == null || e.getPeriod() == period)
                .forEach(exceptionRepo::delete);
    }

    /** Called by the Pro/B2B booking flow — locks the rest of the day. No enum, just a label. */
    @Transactional
    public void autoLockRemainingSlots(Long providerId, LocalDate date, TimeSlot bookedPeriod) {
        Provider provider = providerRepo.getReferenceById(providerId);
        for (TimeSlot p : TimeSlot.values()) {
            if (p == bookedPeriod) continue;
            exceptionRepo.save(AvailabilityException.builder()
                    .provider(provider).dateStart(date).dateEnd(date).period(p)
                    .reason("Pro assignment").createdAt(Instant.now()).build());
        }

        notificationService.sendPrivateNotification(
                provider.getUser().getId(),
                Role.PROVIDER,
                NotificationCategory.BOOKING,
                "Full day locked",
                "A Pro assignment locked your full day on " + date + ".",
                null
        );
    }

    private Provider requireProvider(Long userId) {
        return providerRepo.findByUser_Id(userId)
                .orElseThrow(() -> new IllegalStateException("No provider profile for this account."));
    }
}
