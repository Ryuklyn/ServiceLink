package com.servicelink.core.repository.business.job;

import com.servicelink.core.model.business.job.ProJobStatus;
import com.servicelink.core.model.business.job.ProJobTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProJobTicketRepository extends JpaRepository<ProJobTicket, Long> {
    Page<ProJobTicket> findByOrganizationIdOrderByScheduledDateDescStartTimeDesc(Long organizationId, Pageable pageable);
    Page<ProJobTicket> findByOrganizationIdAndStatusOrderByScheduledDateDescStartTimeDesc(Long organizationId, ProJobStatus status, Pageable pageable);
}
