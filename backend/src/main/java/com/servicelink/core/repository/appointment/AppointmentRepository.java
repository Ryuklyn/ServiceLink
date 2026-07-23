package com.servicelink.core.repository.appointment;

import com.servicelink.core.model.appointment.Appointment;
import com.servicelink.core.model.appointment.AppointmentStatus;
import com.servicelink.core.model.common.TimeSlot;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @Query(value = """
            SELECT a FROM Appointment a
            JOIN FETCH a.provider p
            JOIN FETCH a.serviceCatalog sc
            WHERE a.customerId = :customerId
            ORDER BY a.appointmentDate DESC, a.scheduledAt DESC
            """,
            countQuery = "SELECT COUNT(a) FROM Appointment a WHERE a.customerId = :customerId")
    Page<Appointment> findByCustomerIdWithDetails(
            @Param("customerId") Long customerId,
            Pageable pageable);

    @Query(value = """
            SELECT a FROM Appointment a
            JOIN FETCH a.provider p
            JOIN FETCH a.serviceCatalog sc
            WHERE a.customerId = :customerId AND a.status = :status
            ORDER BY a.appointmentDate DESC, a.scheduledAt DESC
            """,
            countQuery = """
            SELECT COUNT(a) FROM Appointment a
            WHERE a.customerId = :customerId AND a.status = :status
            """)
    Page<Appointment> findByCustomerIdAndStatusWithDetails(
            @Param("customerId") Long customerId,
            @Param("status") AppointmentStatus status,
            Pageable pageable);

    @Query("""
            SELECT a FROM Appointment a
            JOIN FETCH a.provider p
            JOIN FETCH a.serviceCatalog sc
            WHERE a.id = :id AND a.customerId = :customerId
            """)
    Optional<Appointment> findByIdAndCustomerId(
            @Param("id") Long id,
            @Param("customerId") Long customerId);

    @Query(value = """
            SELECT a FROM Appointment a
            JOIN FETCH a.provider p
            JOIN FETCH a.serviceCatalog sc
            WHERE a.provider.id = :providerId
            ORDER BY a.appointmentDate DESC, a.scheduledAt DESC
            """,
            countQuery = "SELECT COUNT(a) FROM Appointment a WHERE a.provider.id = :providerId")
    Page<Appointment> findByProviderIdWithDetails(
            @Param("providerId") Long providerId,
            Pageable pageable);

    @Query(value = """
            SELECT a FROM Appointment a
            JOIN FETCH a.provider p
            JOIN FETCH a.serviceCatalog sc
            WHERE a.provider.id = :providerId AND a.status = :status
            ORDER BY a.appointmentDate DESC, a.scheduledAt DESC
            """,
            countQuery = """
            SELECT COUNT(a) FROM Appointment a
            WHERE a.provider.id = :providerId AND a.status = :status
            """)
    Page<Appointment> findByProviderIdAndStatusWithDetails(
            @Param("providerId") Long providerId,
            @Param("status") AppointmentStatus status,
            Pageable pageable);

    @Query("""
            SELECT a FROM Appointment a
            JOIN FETCH a.provider p
            JOIN FETCH a.serviceCatalog sc
            WHERE a.id = :id AND a.provider.id = :providerId
            """)
    Optional<Appointment> findByIdAndProviderId(
            @Param("id") Long id,
            @Param("providerId") Long providerId);

    @Query("""
            SELECT a FROM Appointment a
            JOIN FETCH a.provider p
            JOIN FETCH a.serviceCatalog sc
            WHERE a.provider.id = :providerId
              AND a.appointmentDate >= :currentDate
              AND a.status IN ('PENDING', 'CONFIRMED')
            ORDER BY a.appointmentDate ASC, a.estimatedStartTime ASC NULLS LAST
            """)
    List<Appointment> findUpcomingByProvider(
            @Param("providerId") Long providerId,
            @Param("currentDate") LocalDate currentDate);

    @Query("""
            SELECT a FROM Appointment a
            JOIN FETCH a.provider p
            JOIN FETCH a.serviceCatalog sc
            WHERE a.provider.id = :providerId
              AND a.appointmentDate = :date
            ORDER BY a.estimatedStartTime ASC NULLS LAST
            """)
    List<Appointment> findByProviderAndDate(
            @Param("providerId") Long providerId,
            @Param("date") LocalDate date);

    @Query("""
            SELECT a FROM Appointment a
            WHERE a.provider.id = :providerId
              AND a.appointmentDate = :date
              AND a.timeSlot = :slot
              AND a.status <> 'CANCELLED'
            """)
    List<Appointment> findActiveByProviderDateAndSlot(
            @Param("providerId") Long providerId,
            @Param("date") LocalDate date,
            @Param("slot") TimeSlot slot);

    @Query("""
            SELECT COUNT(a) > 0 FROM Appointment a
            WHERE a.provider.id = :providerId
              AND a.appointmentDate = :date
              AND a.timeSlot = :slot
              AND a.status <> 'CANCELLED'
            """)
    boolean isSlotTaken(
            @Param("providerId") Long providerId,
            @Param("date") LocalDate date,
            @Param("slot") TimeSlot slot);

    long countByCustomerId(Long customerId);

    long countByCustomerIdAndStatus(Long customerId, AppointmentStatus status);

    long countByProvider_Id(Long providerId);

    long countByProvider_IdAndStatus(Long providerId, AppointmentStatus status);

    boolean existsByCustomerIdAndProvider_IdAndStatus(
            Long customerId, Long providerId, AppointmentStatus status);

    @Query(value = """
            SELECT a FROM Appointment a
            JOIN FETCH a.provider p
            JOIN FETCH a.serviceCatalog sc
            WHERE a.status = :status
            ORDER BY a.scheduledAt DESC
            """,
            countQuery = "SELECT COUNT(a) FROM Appointment a WHERE a.status = :status")
    Page<Appointment> findByStatusWithDetails(
            @Param("status") AppointmentStatus status,
            Pageable pageable);

    @Query("""
            SELECT a FROM Appointment a
            JOIN FETCH a.provider p
            JOIN FETCH a.serviceCatalog sc
            WHERE a.serviceCatalog.id = :catalogId
            ORDER BY a.scheduledAt DESC
            """)
    List<Appointment> findByServiceCatalogId(@Param("catalogId") Long catalogId);

    @Modifying
    @Query("""
            UPDATE Appointment a SET a.status = :newStatus
            WHERE a.status = :currentStatus
              AND a.appointmentDate < :cutoffDate
            """)
    int bulkUpdateExpiredAppointments(
            @Param("currentStatus") AppointmentStatus currentStatus,
            @Param("newStatus") AppointmentStatus newStatus,
            @Param("cutoffDate") LocalDate cutoffDate);

    @Query("""
        SELECT COUNT(a) > 0 FROM Appointment a
        WHERE a.provider.id = :providerId
          AND a.appointmentDate = :date
          AND a.timeSlot = :slot
          AND a.status <> 'CANCELLED'
          AND a.id <> :excludeAppointmentId
        """)
    boolean isSlotTakenExcluding(
            @Param("providerId") Long providerId,
            @Param("date") LocalDate date,
            @Param("slot") TimeSlot slot,
            @Param("excludeAppointmentId") Long excludeAppointmentId);
}
