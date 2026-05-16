package com.servicelink.core.repository.business;

import com.servicelink.core.model.business.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    Optional<PaymentTransaction> findByReferenceId(String referenceId);
    Optional<PaymentTransaction> findByGatewayTransactionId(String gatewayTransactionId);
}
