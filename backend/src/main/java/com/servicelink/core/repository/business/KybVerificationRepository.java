package com.servicelink.core.repository.business;

import com.servicelink.core.model.business.KybVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface KybVerificationRepository extends JpaRepository<KybVerification, Long> {
    Optional<KybVerification> findByOrganizationId(Long orgId);
}
