package com.servicelink.core.controller.admin;

import com.servicelink.core.dto.response.admin.AdminDashboardStatsDTO;
import com.servicelink.core.model.common.KycStatus;
import com.servicelink.core.model.business.SubscriptionStatus;
import com.servicelink.core.repository.KycRepository;
import com.servicelink.core.repository.provider.ProviderRepository;
import com.servicelink.core.repository.business.SubscriptionRepository;
import com.servicelink.core.repository.business.PaymentTransactionRepository;
import com.servicelink.core.repository.business.ProPaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final ProPaymentTransactionRepository proPaymentTransactionRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ProviderRepository providerRepository;
    private final KycRepository kycRepository;

    @GetMapping("/stats")
    public ResponseEntity<AdminDashboardStatsDTO> getDashboardStats() {
        long providerRevenue = paymentTransactionRepository.sumSuccessfulAmountNpr();
        long businessRevenue = proPaymentTransactionRepository.sumSuccessfulAmountNpr();
        long totalRevenue = providerRevenue + businessRevenue;

        long activeProSubscriptions = subscriptionRepository.countBySubscriptionStatus(SubscriptionStatus.ACTIVE);
        long verifiedProviders = providerRepository.countByIsVerifiedTrueAndIsActiveTrue();
        long pendingKycCount = kycRepository.findByStatus(KycStatus.PENDING).size();

        AdminDashboardStatsDTO stats = AdminDashboardStatsDTO.builder()
                .totalRevenue(totalRevenue)
                .activeProSubscriptions(activeProSubscriptions)
                .verifiedProviders(verifiedProviders)
                .pendingKycCount(pendingKycCount)
                .build();

        return ResponseEntity.ok(stats);
    }
}
