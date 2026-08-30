package com.servicelink.core.repository.business.job;

import com.servicelink.core.model.business.job.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByJobTicketId(Long jobTicketId);

    Optional<Attendance> findByJobTicketIdAndProviderId(Long jobTicketId, Long providerId);

    @Query("""
        SELECT a FROM Attendance a
        JOIN a.jobTicket jt
        WHERE jt.organizationId = :organizationId
          AND jt.startDate = :date
    """)
    List<Attendance> findByOrganizationIdAndDate(
        @Param("organizationId") Long organizationId,
        @Param("date") LocalDate date
    );

    @Query("""
        SELECT a FROM Attendance a
        JOIN a.jobTicket jt
        WHERE jt.organizationId = :organizationId
    """)
    List<Attendance> findByOrganizationId(@Param("organizationId") Long organizationId);

    List<Attendance> findByProviderId(Long providerId);
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Attendance a WHERE a.jobTicket.id = :jobId")
    void deleteByJobTicketId(@org.springframework.data.repository.query.Param("jobId") Long jobId);
}
