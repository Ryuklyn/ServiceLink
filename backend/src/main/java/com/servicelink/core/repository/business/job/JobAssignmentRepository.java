package com.servicelink.core.repository.business.job;

import com.servicelink.core.model.business.job.JobAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface JobAssignmentRepository extends JpaRepository<JobAssignment, Long> {
    List<JobAssignment> findByJobTicketId(Long jobTicketId);

    List<JobAssignment> findByProviderId(Long providerId);

    @Query("""
        SELECT a FROM JobAssignment a
        JOIN FETCH a.jobTicket jt
        JOIN FETCH jt.serviceCatalog sc
        WHERE a.provider.id = :providerId
          AND jt.startDate >= :startDate
          AND jt.startDate <= :endDate
    """)
    List<JobAssignment> findByProviderIdAndDateRange(
            @org.springframework.data.repository.query.Param("providerId") Long providerId,
            @org.springframework.data.repository.query.Param("startDate") LocalDate startDate,
            @org.springframework.data.repository.query.Param("endDate") LocalDate endDate);

    Optional<JobAssignment> findByJobTicketIdAndProviderId(Long jobTicketId, Long providerId);

    boolean existsByJobTicketIdAndProviderId(Long jobTicketId, Long providerId);

    long countByJobTicketId(Long jobTicketId);

    @Query("""
        SELECT a FROM JobAssignment a
        JOIN a.jobTicket jt
        WHERE a.provider.id = :providerId
          AND a.status = 'ACCEPTED'
          AND jt.status NOT IN ('CANCELLED', 'UNFULFILLED')
          AND NOT (jt.endDate < :startDate OR jt.startDate > :endDate)
          AND ((jt.startTime <= :startTime AND jt.endTime > :startTime)
               OR (jt.startTime < :endTime AND jt.endTime >= :endTime)
               OR (jt.startTime >= :startTime AND jt.endTime <= :endTime))
    """)
    List<JobAssignment> findOverlappingAssignments(
        @Param("providerId") Long providerId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime
    );
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM JobAssignment a WHERE a.jobTicket.id = :jobId")
    void deleteByJobTicketId(@org.springframework.data.repository.query.Param("jobId") Long jobId);
}
