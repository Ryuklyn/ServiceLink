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

    Optional<JobAssignment> findByJobTicketIdAndProviderId(Long jobTicketId, Long providerId);

    boolean existsByJobTicketIdAndProviderId(Long jobTicketId, Long providerId);

    long countByJobTicketId(Long jobTicketId);

    @Query("""
        SELECT a FROM JobAssignment a
        JOIN a.jobTicket jt
        WHERE a.provider.id = :providerId
          AND jt.scheduledDate = :scheduledDate
          AND jt.status NOT IN ('CANCELLED', 'UNFULFILLED')
          AND ((jt.startTime <= :startTime AND jt.endTime > :startTime)
               OR (jt.startTime < :endTime AND jt.endTime >= :endTime)
               OR (jt.startTime >= :startTime AND jt.endTime <= :endTime))
    """)
    List<JobAssignment> findOverlappingAssignments(
        @Param("providerId") Long providerId,
        @Param("scheduledDate") LocalDate scheduledDate,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime
    );
}
