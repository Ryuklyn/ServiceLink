package com.servicelink.core.repository.business.job;

import com.servicelink.core.model.business.job.ProAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProAuditLogRepository extends JpaRepository<ProAuditLog, Long> {
    List<ProAuditLog> findByOrganizationIdOrderByTimestampDesc(Long organizationId);

    List<ProAuditLog> findByJobTicketIdOrderByTimestampDesc(Long jobTicketId);
}
