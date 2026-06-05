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

    // Paged + JOIN FETCH — use this for the dashboard list
    @Query("""
            SELECT a FROM Appointment a
            JOIN FETCH a.provider p
            JOIN FETCH a.serviceCatalog sc
            WHERE a.customerId = :customerId
            ORDER BY a.appointmentDate DESC, a.scheduledAt DESC
            """)
    Page<Appointment> findByCustomerIdWithDetails(
            @Param("customerId") Long customerId, Pageable pageable);

    // Ownership-validated single fetch — use this for appointment detail page
    @Query("""
            SELECT a FROM Appointment a
            JOIN FETCH a.provider p
            JOIN FETCH a.serviceCatalog sc
            WHERE a.id = :id AND a.customerId = :customerId
            """)
    Optional<Appointment> findByIdAndCustomerId(
            @Param("id") Long id,
            @Param("customerId") Long customerId);

    // Plain list — kept for simple internal use where pagination isn't needed
    List<Appointment> findByCustomerId(Long customerId);

    // Status-filtered for a specific customer (with JOIN FETCH)
    @Query("""
            SELECT a FROM Appointment a
            JOIN FETCH a.provider p
            JOIN FETCH a.serviceCatalog sc
            WHERE a.customerId = :customerId AND a.status = :status
            ORDER BY a.appointmentDate DESC
            """)
    List<Appointment> findByCustomerIdAndStatus(
            @Param("customerId") Long customerId,
            @Param("status") AppointmentStatus status);

    // ── Slot conflict detection ───────────────────────────────────────────────

    // Slot-aware conflict check — core of the booking engine
    @Query("""
            SELECT a FROM Appointment a
            WHERE a.provider.id = :providerId
              AND a.appointmentDate = :date
              AND a.timeSlot = :slot
              AND a.status NOT IN ('CANCELLED', 'NO_SHOW')
            ORDER BY a.estimatedStartTime ASC NULLS FIRST
            """)
    List<Appointment> findActiveByProviderDateAndSlot(
            @Param("providerId") Long providerId,
            @Param("date") LocalDate date,
            @Param("slot") TimeSlot slot);

    // Full day view — all slots combined, useful for provider calendar rendering
    List<Appointment> findByProviderIdAndAppointmentDate(
            Long providerId, LocalDate appointmentDate);

    // ── Provider dashboard ────────────────────────────────────────────────────

    // Paged provider view with JOIN FETCH
    @Query("""
            SELECT a FROM Appointment a
            JOIN FETCH a.serviceCatalog sc
            WHERE a.provider.id = :providerId
            ORDER BY a.appointmentDate DESC, a.scheduledAt DESC
            """)
    Page<Appointment> findByProviderIdWithDetails(
            @Param("providerId") Long providerId, Pageable pageable);

    // Upcoming only — used for provider's home screen job queue
    @Query("""
            SELECT a FROM Appointment a
            JOIN FETCH a.serviceCatalog sc
            WHERE a.provider.id = :providerId
              AND a.appointmentDate >= :currentDate
            ORDER BY a.appointmentDate ASC, a.estimatedStartTime ASC
            """)
    List<Appointment> findUpcomingByProvider(
            @Param("providerId") Long providerId,
            @Param("currentDate") LocalDate currentDate);

    // ── Admin ─────────────────────────────────────────────────────────────────

    // System-wide status filter — admin dashboard
    List<Appointment> findByStatus(AppointmentStatus status);

    // Analytics: all bookings for a specific sub-service
    List<Appointment> findByServiceCatalogId(Long serviceCatalogId);

    // ── Stats ─────────────────────────────────────────────────────────────────

    long countByProvider_IdAndStatus(Long providerId, AppointmentStatus status);

    long countByCustomerIdAndStatus(Long customerId, AppointmentStatus status);

    // Review gate: customer can only review after a COMPLETED booking with this provider
    boolean existsByCustomerIdAndProvider_IdAndStatus(
            Long customerId, Long providerId, AppointmentStatus status);
}