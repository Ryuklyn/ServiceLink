package com.servicelink.core.repository.business.job;

import com.servicelink.core.model.business.job.ProJobBilling;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProJobBillingRepository extends JpaRepository<ProJobBilling, Long> {
    Optional<ProJobBilling> findByJobTicketId(Long jobTicketId);

    List<ProJobBilling> findByOrganizationId(Long organizationId);

    List<ProJobBilling> findByJobTicket_OrganizationId(Long organizationId);
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM ProJobBilling b WHERE b.jobTicket.id = :jobId")
    void deleteByJobTicketId(@org.springframework.data.repository.query.Param("jobId") Long jobId);
}
