package com.servicelink.core.repository.business;

import com.servicelink.core.model.business.PaymentTransaction;
import com.servicelink.core.model.business.PaymentGateway;
import com.servicelink.core.model.business.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    Optional<PaymentTransaction> findByReferenceId(String referenceId);
    Optional<PaymentTransaction> findByGatewayTransactionId(String gatewayTransactionId);

    // Added — needed for PaymentService.getTransactionsForProvider() to build
    // the Billing History table on the Subscription page.
    List<PaymentTransaction> findBySubscription_Id(Long subscriptionId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(t.amountNpr), 0) FROM PaymentTransaction t WHERE t.paymentStatus = 'SUCCESS'")
    long sumSuccessfulAmountNpr();

    @Query("""
            SELECT t FROM PaymentTransaction t
            JOIN FETCH t.subscription s
            JOIN FETCH s.provider p
            WHERE (:gateway IS NULL OR t.paymentGateway = :gateway)
              AND (:status IS NULL OR t.paymentStatus = :status)
              AND (:search IS NULL
                   OR LOWER(t.referenceId) LIKE CONCAT('%', :search, '%')
                   OR LOWER(COALESCE(t.gatewayTransactionId, '')) LIKE CONCAT('%', :search, '%')
                   OR LOWER(p.fullName) LIKE CONCAT('%', :search, '%')
                   OR LOWER(p.email) LIKE CONCAT('%', :search, '%'))
            """)
    Page<PaymentTransaction> searchForAdmin(
            @Param("gateway") PaymentGateway gateway,
            @Param("status") PaymentStatus status,
            @Param("search") String search,
            Pageable pageable
    );
}
