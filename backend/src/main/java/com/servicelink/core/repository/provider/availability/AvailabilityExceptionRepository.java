package com.servicelink.core.repository.provider.availability;

import com.servicelink.core.model.provider.availability.AvailabilityException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AvailabilityExceptionRepository extends JpaRepository<AvailabilityException, Long> {
    @Query("select e from AvailabilityException e where e.provider.id = :providerId " +
            "and e.dateStart <= :end and e.dateEnd >= :start")
    List<AvailabilityException> findOverlapping(Long providerId, LocalDate start, LocalDate end);

    Optional<AvailabilityException> findFirstByProvider_IdAndDateStartAndDateEndAndPeriod(
            Long providerId, LocalDate dateStart, LocalDate dateEnd,
            com.servicelink.core.model.common.TimeSlot period);
}
