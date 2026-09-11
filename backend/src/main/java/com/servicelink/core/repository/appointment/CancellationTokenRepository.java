package com.servicelink.core.repository.appointment;

import com.servicelink.core.model.appointment.CancellationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

@Repository
public interface CancellationTokenRepository extends JpaRepository<CancellationToken, Long> {

    Optional<CancellationToken> findByCustomerIdAndYear(Long customerId, int year);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM CancellationToken t WHERE t.customerId = :customerId AND t.year = :year")
    Optional<CancellationToken> findByCustomerIdAndYearForUpdate(
            @Param("customerId") Long customerId,
            @Param("year") int year);
}
