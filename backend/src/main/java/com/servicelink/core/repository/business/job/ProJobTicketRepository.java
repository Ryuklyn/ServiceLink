package com.servicelink.core.repository.business.job;

import com.servicelink.core.model.business.job.ProJobStatus;
import com.servicelink.core.model.business.job.ProJobTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProJobTicketRepository extends JpaRepository<ProJobTicket, Long> {
    Page<ProJobTicket> findByOrganizationIdOrderByStartDateDescStartTimeDesc(Long organizationId, Pageable pageable);
    Page<ProJobTicket> findByOrganizationIdAndStatusOrderByStartDateDescStartTimeDesc(Long organizationId, ProJobStatus status, Pageable pageable);
}
