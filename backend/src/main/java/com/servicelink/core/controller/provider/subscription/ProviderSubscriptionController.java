package com.servicelink.core.controller.provider.subscription;

import com.servicelink.core.dto.request.business.PaymentVerifyRequest;
import com.servicelink.core.dto.request.provider.subscription.SubscriptionCheckoutRequestDTO;
import com.servicelink.core.dto.response.business.PaymentInitiateResponse;
import com.servicelink.core.dto.response.business.PaymentTransactionResponse;
import com.servicelink.core.dto.response.provider.subscription.SubscriptionStatusDTO;
import com.servicelink.core.exception.ResourceNotFoundException;
import com.servicelink.core.model.user.User;
import com.servicelink.core.payment.service.PaymentService;
import com.servicelink.core.repository.provider.ProviderRepository;
import com.servicelink.core.service.provider.subscription.ProviderSubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/providers/me/subscription")
@RequiredArgsConstructor
public class ProviderSubscriptionController {

    private final ProviderSubscriptionService subscriptionService;
    private final ProviderRepository providerRepo;
    private final PaymentService paymentService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @GetMapping
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<SubscriptionStatusDTO> getMySubscription(@AuthenticationPrincipal User user) {
        Long providerId = providerRepo.findByUser_Id(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider for user", user.getId()))
                .getId();
        return ResponseEntity.ok(subscriptionService.getStatus(providerId));
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<PaymentTransactionResponse>> getTransactions(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(paymentService.getTransactionsForProvider(user.getId()));
    }

    @PostMapping("/checkout")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<PaymentInitiateResponse> checkout(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid SubscriptionCheckoutRequestDTO req
    ) throws Exception {
        String successUrl = frontendUrl + "/dashboard/provider/subscription/success";
        String failureUrl = frontendUrl + "/dashboard/provider/subscription DLKKKFKKG[DPP;L  BGJFEFVHERKDHCHJHDHYCHCSGG  /failure";

        return ResponseEntity.ok(paymentService.checkout(user.getId(), req, successUrl, failureUrl));
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<PaymentTransactionResponse> verify(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid PaymentVerifyRequest req
    ) throws Exception {
        return ResponseEntity.ok(paymentService.verifyAndSync(user.getId(), req));
    }
}