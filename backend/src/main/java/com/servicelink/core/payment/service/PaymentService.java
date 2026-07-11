package com.servicelink.core.payment.service;

import com.servicelink.core.dto.request.business.PaymentInitiateRequest;
import com.servicelink.core.dto.request.business.PaymentVerifyRequest;
import com.servicelink.core.dto.request.provider.subscription.SubscriptionCheckoutRequestDTO;
import com.servicelink.core.dto.response.business.PaymentInitiateResponse;
import com.servicelink.core.dto.response.business.PaymentTransactionResponse;
import com.servicelink.core.exception.BusinessException;
import com.servicelink.core.exception.ResourceNotFoundException;
import com.servicelink.core.mapper.business.PaymentMapper;
import com.servicelink.core.model.business.PaymentGateway;
import com.servicelink.core.model.business.PaymentStatus;
import com.servicelink.core.model.business.PaymentTransaction;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.provider.subscription.ProviderSubscription;
import com.servicelink.core.model.provider.subscription.SubscriptionPlanType;
import com.servicelink.core.payment.gateway.EsewaGatewayService;
import com.servicelink.core.payment.gateway.KhaltiGatewayService;
import com.servicelink.core.repository.provider.ProviderRepository;
import com.servicelink.core.repository.business.PaymentTransactionRepository;
import com.servicelink.core.repository.provider.subscription.ProviderSubscriptionRepository;
import com.servicelink.core.service.provider.subscription.ProviderSubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.Comparator;
import java.util.List;
import java.util.Random;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentTransactionRepository transactionRepository;
    private final ProviderSubscriptionRepository providerSubscriptionRepo;
    private final EsewaGatewayService esewaService;
    private final KhaltiGatewayService khaltiService;
    private final PaymentMapper paymentMapper;
    private final ProviderRepository providerRepo;
    private final ProviderSubscriptionService providerSubscriptionService;

    // ─────────────────────────────────────────────────────────────
    // Step 1: Initiate — build gateway URL, save INITIATED record
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public PaymentInitiateResponse initiatePayment(PaymentInitiateRequest request) throws Exception {

        ProviderSubscription subscription = providerSubscriptionRepo
                .findById(request.getSubscriptionId())
                .orElseThrow(() -> new RuntimeException(
                        "Subscription not found: " + request.getSubscriptionId()));

        String referenceId =
                "SLP-" + Year.now().getValue() + "-"
                        + String.format("%06d", new Random().nextInt(999999));

        log.info("Initiating payment: ref={} gateway={} amountNpr={}",
                referenceId, request.getPaymentGateway(), request.getAmountNpr());

        if (request.getPaymentGateway() == PaymentGateway.BANK_TRANSFER) {
            throw new UnsupportedOperationException("Bank transfer is not supported yet");
        }

        transactionRepository.findByReferenceId(referenceId).ifPresent(existing -> {
            if (existing.getPaymentStatus() == PaymentStatus.SUCCESS) {
                throw new IllegalStateException(
                        "Payment already completed for ref: " + referenceId);
            }
            log.warn("Re-initiating payment: ref={} previousStatus={}",
                    referenceId, existing.getPaymentStatus());
        });

        String gatewayRedirectUrl;
        String gatewayMethod = "GET";
        java.util.Map<String, String> gatewayFormFields = null;
        String pidx = null;

        switch (request.getPaymentGateway()) {
            case ESEWA -> {
                EsewaGatewayService.EsewaPaymentForm form = esewaService.buildPaymentForm(
                        referenceId,
                        request.getAmountNpr(),
                        request.getSuccessUrl(),
                        request.getFailureUrl()
                );
                gatewayRedirectUrl = form.actionUrl();
                gatewayMethod = "POST";
                gatewayFormFields = form.fields();
                log.info("eSewa payment form built: ref={}", referenceId);
            }
            case KHALTI -> {
                long amountPaisa = request.getAmountNpr() * 100L;
                KhaltiGatewayService.KhaltiInitiateResult result = khaltiService.initiatePayment(
                        referenceId,
                        amountPaisa,
                        "ServiceLink " + subscription.getPlanType().name() + " Plan",
                        request.getSuccessUrl()
                );
                pidx = result.pidx();
                gatewayRedirectUrl = result.paymentUrl();
                log.info("Khalti payment initiated: ref={} pidx={}", referenceId, pidx);
            }
            default -> throw new IllegalArgumentException(
                    "Unsupported gateway: " + request.getPaymentGateway());
        }

        PaymentTransaction tx = PaymentTransaction.builder()
                .subscription(subscription)
                .referenceId(referenceId)
                .paymentGateway(request.getPaymentGateway())
                .paymentStatus(PaymentStatus.INITIATED)
                .amountNpr(request.getAmountNpr())
                .gatewayRedirectUrl(gatewayRedirectUrl)
                .gatewayTransactionId(pidx)
                .build();

        transactionRepository.save(tx);
        log.info("PaymentTransaction saved: ref={} status=INITIATED", referenceId);

        return PaymentInitiateResponse.builder()
                .referenceId(referenceId)
                .gatewayRedirectUrl(gatewayRedirectUrl)
                .gatewayMethod(gatewayMethod)
                .gatewayFormFields(gatewayFormFields)
                .gateway(request.getPaymentGateway().name())
                .status(PaymentStatus.INITIATED.name())
                .build();
    }

    // ─────────────────────────────────────────────────────────────
    // Step 2: Verify — confirm with gateway. Does NOT touch the
    // ProviderSubscription itself; that's verifyAndSync()'s job via
    // ProviderSubscriptionService.upgradePlan(), which is the single
    // source of truth for plan/status/dates (correct per-plan duration,
    // isActive sync, etc.) — duplicating that logic here would fight it.
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public PaymentTransactionResponse verifyAndComplete(PaymentVerifyRequest request) throws Exception {

        PaymentTransaction tx = transactionRepository
                .findByReferenceId(request.getReferenceId())
                .orElseThrow(() -> new RuntimeException(
                        "Transaction not found: " + request.getReferenceId()));

        log.info("Verifying payment: ref={} gateway={} currentStatus={}",
                tx.getReferenceId(), tx.getPaymentGateway(), tx.getPaymentStatus());

        if (tx.getPaymentStatus() == PaymentStatus.SUCCESS) {
            log.warn("Payment already verified, skipping: ref={}", tx.getReferenceId());
            return paymentMapper.toResponse(tx);
        }

        boolean verified = switch (tx.getPaymentGateway()) {
            case ESEWA -> esewaService.verifyPayment(
                    tx.getReferenceId(),
                    tx.getAmountNpr(),
                    request.getGatewayResponseData()
            );
            case KHALTI -> khaltiService.verifyPayment(
                    tx.getGatewayTransactionId(),
                    tx.getAmountNpr() * 100L
            );
            case BANK_TRANSFER -> throw new UnsupportedOperationException(
                    "Bank transfer verification not implemented yet"
            );
        };

        if (verified) {
            tx.setPaymentStatus(PaymentStatus.SUCCESS);
            tx.setGatewayTransactionId(request.getGatewayTransactionId());
            tx.setGatewayResponse(request.getGatewayResponseData());
            tx.setCompletedAt(java.time.LocalDateTime.now());
            log.info("Payment verified SUCCESS: ref={}", tx.getReferenceId());
        } else {
            tx.setPaymentStatus(PaymentStatus.FAILED);
            log.warn("Payment verification FAILED: ref={} gateway={}",
                    tx.getReferenceId(), tx.getPaymentGateway());
        }

        return paymentMapper.toResponse(transactionRepository.save(tx));
    }

    // ─────────────────────────────────────────────────────────────
    // Checkout — bridges plan selection to an actual gateway payment.
    // Requires the provider to already have a ProviderSubscription row
    // (created at onboarding via issueTrialIfEligible) — checkout does
    // not create one, only ProviderSubscriptionService owns that.
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public PaymentInitiateResponse checkout(Long userId, SubscriptionCheckoutRequestDTO req,
                                            String successUrl, String failureUrl) throws Exception {
        Provider provider = providerRepo.findByUser_Id(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider for user", userId));

        long amountNpr = resolvePrice(req.getSubscriptionPlanType()); // server-side source of truth

        ProviderSubscription bizSub = providerSubscriptionRepo.findByProvider_Id(provider.getId())
                .orElseThrow(() -> new BusinessException(
                        "No subscription found for provider", "SUBSCRIPTION_NOT_FOUND"));

        // Tentatively record the plan being purchased so initiatePayment() and
        // the later verifyAndSync() can read it off the linked subscription —
        // upgradePlan() re-applies plan/status/dates correctly once payment is
        // actually confirmed, so this early write is safely overwritten either
        // way (a failed payment just leaves a stale planType until the next
        // successful checkout, with no dates/status changed — isCurrentlyActive()
        // is driven by endDate/status, not planType, so this can't fake activation).
        bizSub.setPlanType(req.getSubscriptionPlanType());
        providerSubscriptionRepo.save(bizSub);

        PaymentInitiateRequest payReq = new PaymentInitiateRequest();
        payReq.setSubscriptionId(bizSub.getId());
        payReq.setAmountNpr(amountNpr);
        payReq.setPaymentGateway(req.getPaymentGateway());
        payReq.setSuccessUrl(successUrl);
        payReq.setFailureUrl(failureUrl);

        return initiatePayment(payReq);
    }

    private long resolvePrice(SubscriptionPlanType plan) {
        return switch (plan) {
            case MONTHLY -> 500L;
            case QUARTERLY -> 1200L;
            case YEARLY -> 4000L;
            default -> throw new BusinessException("Unsupported plan for checkout", "INVALID_PLAN");
        };
    }

    // ─────────────────────────────────────────────────────────────
    // The sync — activates the REAL provider subscription via
    // ProviderSubscriptionService, which sets plan/status/dates and
    // syncs Provider.isActive, all in one authoritative place.
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public PaymentTransactionResponse verifyAndSync(Long userId, PaymentVerifyRequest req) throws Exception {
        Provider provider = providerRepo.findByUser_Id(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider for user", userId));

        PaymentTransactionResponse result = verifyAndComplete(req);

        if (result.getStatus() == PaymentStatus.SUCCESS) {
            transactionRepository.findByReferenceId(req.getReferenceId())
                    .map(PaymentTransaction::getSubscription)
                    .ifPresent(sub ->
                            providerSubscriptionService.upgradePlan(provider.getId(), sub.getPlanType()));
        }
        return result;
    }

    // ─────────────────────────────────────────────────────────────
    // Billing history
    // ─────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<PaymentTransactionResponse> getTransactionsForProvider(Long userId) {
        Provider provider = providerRepo.findByUser_Id(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider for user", userId));

        return providerSubscriptionRepo.findByProvider_Id(provider.getId())
                .map(sub -> transactionRepository.findBySubscription_Id(sub.getId()))
                .orElse(List.of())
                .stream()
                .sorted(Comparator.comparing(
                        PaymentTransaction::getCompletedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(paymentMapper::toResponse)
                .toList();
    }
}