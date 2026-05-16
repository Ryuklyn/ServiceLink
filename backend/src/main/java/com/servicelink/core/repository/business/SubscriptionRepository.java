package com.servicelink.core.repository.business;

import com.servicelink.core.model.business.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByWorkspaceId(Long workspaceId);
    Optional<Subscription> findByReferenceId(String referenceId);
}
