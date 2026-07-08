package com.servicelink.core.repository.provider.subscription;

import com.servicelink.core.model.provider.subscription.ProviderSubscription;
import com.servicelink.core.model.provider.subscription.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface ProviderSubscriptionRepository extends JpaRepository<ProviderSubscription, Long> {

    Optional<ProviderSubscription> findByProvider_Id(Long providerId);

    boolean existsByProvider_Id(Long providerId);

    // Feeds the daily expiry sweep.
    List<ProviderSubscription> findByStatusAndEndDateBefore(SubscriptionStatus status, Instant cutoff);
}
