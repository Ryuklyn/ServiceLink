package com.servicelink.core;

import com.servicelink.core.dto.availability.ScheduleSettingsDTO;
import com.servicelink.core.model.common.TimeSlot;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.repository.provider.ProviderRepository;
import com.servicelink.core.repository.provider.availability.AvailabilityExceptionRepository;
import com.servicelink.core.service.provider.availability.AvailabilityExceptionService;
import com.servicelink.core.service.provider.availability.AvailabilityResolverService;
import com.servicelink.core.service.provider.availability.ProviderScheduleSettingsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class AvailabilityFlowIntegrationTests {

    @Autowired private ProviderRepository providerRepository;
    @Autowired private ProviderScheduleSettingsService settingsService;
    @Autowired private AvailabilityExceptionService exceptionService;
    @Autowired private AvailabilityExceptionRepository exceptionRepository;
    @Autowired private AvailabilityResolverService resolverService;

    @Test
    void weeklyPatternAndDailyOverrideRoundTrip() {
        Provider provider = providerRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("Availability test requires a provider"));
        Long userId = provider.getUser().getId();
        LocalDate testDate = LocalDate.of(2099, 1, 5);

        settingsService.updateMySettings(userId,
                new ScheduleSettingsDTO(Set.of(1, 2, 3, 4, 5),
                        Set.of(TimeSlot.MORNING, TimeSlot.AFTERNOON), false));

        ScheduleSettingsDTO saved = settingsService.getMySettings(userId);
        assertEquals(Set.of(1, 2, 3, 4, 5), saved.workingDays());
        assertEquals(Set.of(TimeSlot.MORNING, TimeSlot.AFTERNOON), saved.defaultSlots());

        exceptionService.createException(userId, testDate, TimeSlot.MORNING, "Personal Work");
        exceptionService.createException(userId, testDate, TimeSlot.MORNING, "Holiday");

        var stored = exceptionRepository
                .findFirstByProvider_IdAndDateStartAndDateEndAndPeriod(
                        provider.getId(), testDate, testDate, TimeSlot.MORNING)
                .orElseThrow();
        assertEquals("Holiday", stored.getReason());

        var resolved = resolverService.resolveRange(provider.getId(), testDate, testDate, true);
        assertEquals(3, resolved.size());
        assertTrue(resolved.stream().anyMatch(slot ->
                slot.getPeriod() == TimeSlot.MORNING
                        && !slot.getIsAvailable()
                        && "Holiday".equals(slot.getReason())));

        exceptionService.deleteCoveringException(userId, testDate, TimeSlot.MORNING);
        assertTrue(exceptionRepository
                .findFirstByProvider_IdAndDateStartAndDateEndAndPeriod(
                        provider.getId(), testDate, testDate, TimeSlot.MORNING)
                .isEmpty());
    }
}
