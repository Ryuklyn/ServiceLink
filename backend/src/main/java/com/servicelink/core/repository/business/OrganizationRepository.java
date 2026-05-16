package com.servicelink.core.repository.business;

import com.servicelink.core.model.business.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    Optional<Organization> findByWorkEmail(String workEmail);
    boolean existsByWorkEmail(String workEmail);
}
