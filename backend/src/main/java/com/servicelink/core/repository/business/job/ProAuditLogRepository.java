package com.servicelink.core.repository.business.job;

import com.servicelink.core.model.business.job.ProAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProAuditLogRepository extends JpaRepository<ProAuditLog, Long> {
    List<ProAuditLog> findByOrganizationIdOrderByTimestampDesc(Long organizationId);

    List<ProAuditLog> findByJobTicketIdOrderByTimestampDesc(Long jobTicketId);
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM ProAuditLog l WHERE l.jobTicketId = :jobId")
    void deleteByJobTicketId(@org.springframework.data.repository.query.Param("jobId") Long jobId);
}
