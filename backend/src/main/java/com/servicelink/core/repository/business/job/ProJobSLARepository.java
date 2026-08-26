package com.servicelink.core.repository.business.job;

import com.servicelink.core.model.business.job.ProJobSLA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProJobSLARepository extends JpaRepository<ProJobSLA, Long> {
    List<ProJobSLA> findByJobTicketId(Long jobTicketId);

    @Query("""
        SELECT s FROM ProJobSLA s
        JOIN s.jobTicket jt
        WHERE jt.organizationId = :organizationId
    """)
    List<ProJobSLA> findByOrganizationId(@Param("organizationId") Long organizationId);

    List<ProJobSLA> findByProviderId(Long providerId);
}
