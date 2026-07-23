package com.servicelink.core.repository.appointment;

import com.servicelink.core.model.appointment.RescheduleToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

@Repository
public interface RescheduleTokenRepository extends JpaRepository<RescheduleToken, Long> {

    Optional<RescheduleToken> findByCustomerIdAndYear(Long customerId, int year);

    /**
     * Pessimistic write lock variant — used only by useToken() so two concurrent
     * reschedule requests for the same customer can't both read "1 remaining"
     * and both decrement past zero. The @Version field on the entity is a
     * secondary guard if this lock is ever bypassed.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM RescheduleToken t WHERE t.customerId = :customerId AND t.year = :year")
    Optional<RescheduleToken> findByCustomerIdAndYearForUpdate(
            @Param("customerId") Long customerId,
            @Param("year") int year);
}
