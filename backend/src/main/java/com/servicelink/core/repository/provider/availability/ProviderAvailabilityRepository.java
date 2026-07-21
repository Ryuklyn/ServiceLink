package com.servicelink.core.repository.provider.availability;

import com.servicelink.core.model.common.TimeSlot;
import com.servicelink.core.model.provider.availability.ProviderAvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProviderAvailabilityRepository extends JpaRepository<ProviderAvailabilitySlot, Long> {

    List<ProviderAvailabilitySlot> findByProvider_IdAndDateBetween(
            Long providerId, LocalDate start, LocalDate end);

    Optional<ProviderAvailabilitySlot> findByProvider_IdAndDateAndPeriod(
            Long providerId, LocalDate date, TimeSlot period);
}