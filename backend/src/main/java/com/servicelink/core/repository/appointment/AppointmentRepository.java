package com.servicelink.core.repository.appointment;

import com.servicelink.core.model.appointment.Appointment;
import com.servicelink.core.model.appointment.AppointmentStatus;
import com.servicelink.core.model.common.TimeSlot;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // ── User dashboard ────────────────────────────────────────────────────────

    /**
     * All appointments for a customer, newest first, paged.
     * Fetches provider and providerService in one query to avoid N+1.
     */
    @Query("""
            SELECT a FROM Appointment a
            JOIN FETCH a.provider p
            JOIN FETCH a.providerService ps
            JOIN FETCH ps.catalogItem
            WHERE a.customer.id = :customerId
            ORDER BY a.appointmentDate DESC, a.estimatedStartTime DESC
            """)
    Page<Appointment> findByCustomerIdWithDetails(
            @Param("customerId") Long customerId, Pageable pageable);

    /**
     * Single appointment detail — verifies customer ownership.
     */
    @Query("""
            SELECT a FROM Appointment a
            JOIN FETCH a.provider p
            JOIN FETCH a.providerService ps
            JOIN FETCH ps.catalogItem
            WHERE a.id = :appointmentId AND a.customer.id = :customerId
            """)
    Optional<Appointment> findByIdAndCustomerId(
            @Param("appointmentId") Long appointmentId,
            @Param("customerId") Long customerId);

    // ── Slot conflict detection ───────────────────────────────────────────────

    /**
     * All non-cancelled appointments for a provider on a given date+slot.
     * Used to detect time overlaps and enforce slot capacity.
     */
    @Query("""
            SELECT a FROM Appointment a
            WHERE a.provider.id = :providerId
              AND a.appointmentDate = :date
              AND a.timeSlot = :slot
              AND a.status NOT IN ('CANCELLED', 'NO_SHOW')
            ORDER BY a.estimatedStartTime ASC
            """)
    List<Appointment> findActiveByProviderDateSlot(
            @Param("providerId") Long providerId,
            @Param("date") LocalDate date,
            @Param("slot") TimeSlot slot);

    // ── Provider dashboard (for future use) ───────────────────────────────────

    @Query("""
            SELECT a FROM Appointment a
            JOIN FETCH a.customer u
            JOIN FETCH a.providerService ps
            JOIN FETCH ps.catalogItem
            WHERE a.provider.id = :providerId
            ORDER BY a.appointmentDate DESC, a.estimatedStartTime DESC
            """)
    Page<Appointment> findByProviderIdWithDetails(
            @Param("providerId") Long providerId, Pageable pageable);

    // ── Stats ─────────────────────────────────────────────────────────────────

    long countByProvider_IdAndStatus(Long providerId, AppointmentStatus status);

    long countByCustomer_IdAndStatus(Long customerId, AppointmentStatus status);
}
