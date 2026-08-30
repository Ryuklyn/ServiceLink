package com.servicelink.core.repository.business;

import com.servicelink.core.model.business.ProPaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProPaymentTransactionRepository extends JpaRepository<ProPaymentTransaction, Long> {
    Optional<ProPaymentTransaction> findByReferenceId(String referenceId);
    java.util.List<ProPaymentTransaction> findBySubscriptionId(Long subscriptionId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(t.amountNpr), 0) FROM ProPaymentTransaction t WHERE t.paymentStatus = 'SUCCESS'")
    long sumSuccessfulAmountNpr();
}