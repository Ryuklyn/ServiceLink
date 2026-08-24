package com.servicelink.core.repository.business;

import com.servicelink.core.model.business.providerpool.ProviderPoolEntry;
import com.servicelink.core.model.business.providerpool.ProviderPoolStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProviderPoolEntryRepository extends JpaRepository<ProviderPoolEntry, Long> {

    List<ProviderPoolEntry> findAllByOrganizationId(Long organizationId);

    List<ProviderPoolEntry> findAllByOrganizationIdAndStatus(Long organizationId, ProviderPoolStatus status);

    Optional<ProviderPoolEntry> findByIdAndOrganizationId(Long id, Long organizationId);

    boolean existsByOrganizationIdAndProviderId(Long organizationId, Long providerId);

    // Used by ProviderDirectoryService to exclude already-pooled providers —
    // once added, a provider is only managed from the Provider Pool page.
    @Query("select e.provider.id from ProviderPoolEntry e where e.organizationId = :organizationId")
    List<Long> findProviderIdsByOrganizationId(@Param("organizationId") Long organizationId);
}