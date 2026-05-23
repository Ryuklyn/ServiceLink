package com.servicelink.core.payment.service;

import com.servicelink.core.dto.request.business.PaymentInitiateRequest;
import com.servicelink.core.dto.request.business.PaymentVerifyRequest;
import com.servicelink.core.dto.response.business.PaymentInitiateResponse;
import com.servicelink.core.dto.response.business.PaymentTransactionResponse;
import com.servicelink.core.mapper.business.PaymentMapper;
import com.servicelink.core.model.business.*;
import com.servicelink.core.payment.gateway.EsewaGatewayService;
import com.servicelink.core.payment.gateway.KhaltiGatewayService;
import com.servicelink.core.repository.business.PaymentTransactionRepository;
import com.servicelink.core.repository.business.SubscriptionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.Random;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentTransactionRepository transactionRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final EsewaGatewayService esewaService;
    private final KhaltiGatewayService khaltiService;
    private final PaymentMapper paymentMapper;

    // ─────────────────────────────────────────────────────────────
    // Step 1: Initiate — build gateway URL, save INITIATED record
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public PaymentInitiateResponse initiatePayment(PaymentInitiateRequest request) throws Exception {

        // ✅ load subscription
        Subscription subscription = subscriptionRepository
                .findById(request.getSubscriptionId())
                .orElseThrow(() -> new RuntimeException(
                        "Subscription not found: " + request.getSubscriptionId()));

//        String referenceId = subscription.getReferenceId();
        String referenceId =
                "SLP-" + Year.now().getValue() + "-"
                        + String.format("%06d", new Random().nextInt(999999));

        log.info("Initiating payment: ref={} gateway={} amountNpr={}",
                referenceId, request.getPaymentGateway(), request.getAmountNpr());

        // ✅ block BANK_TRANSFER early before any processing
        if (request.getPaymentGateway() == PaymentGateway.BANK_TRANSFER) {
            throw new UnsupportedOperationException("Bank transfer is not supported yet");
        }

        // ✅ duplicate SUCCESS guard — reject if already paid
        transactionRepository.findByReferenceId(referenceId).ifPresent(existing -> {
            if (existing.getPaymentStatus() == PaymentStatus.SUCCESS) {
                throw new IllegalStateException(
                        "Payment already completed for ref: " + referenceId);
            }
            // ✅ warn if re-initiating after FAILED or INITIATED (allowed)
            log.warn("Re-initiating payment: ref={} previousStatus={}",
                    referenceId, existing.getPaymentStatus());
        });

        // ✅ resolve gateway URL + pidx
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

        // ✅ persist transaction — field names match PaymentTransaction entity
        PaymentTransaction tx = PaymentTransaction.builder()
                .subscription(subscription)
                .referenceId(referenceId)
                .paymentGateway(request.getPaymentGateway())
                .paymentStatus(PaymentStatus.INITIATED)
                .amountNpr(request.getAmountNpr())
                .gatewayRedirectUrl(gatewayRedirectUrl)
                .gatewayTransactionId(pidx)       // null for eSewa, pidx for Khalti
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
    // Step 2: Verify — confirm with gateway, activate subscription
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public PaymentTransactionResponse verifyAndComplete(PaymentVerifyRequest request) throws Exception {

        // ✅ load existing transaction
        PaymentTransaction tx = transactionRepository
                .findByReferenceId(request.getReferenceId())
                .orElseThrow(() -> new RuntimeException(
                        "Transaction not found: " + request.getReferenceId()));

        log.info("Verifying payment: ref={} gateway={} currentStatus={}",
                tx.getReferenceId(), tx.getPaymentGateway(), tx.getPaymentStatus());

        // ✅ idempotency — skip re-verification if already SUCCESS
        if (tx.getPaymentStatus() == PaymentStatus.SUCCESS) {
            log.warn("Payment already verified, skipping: ref={}", tx.getReferenceId());
            return paymentMapper.toResponse(tx);
        }

        // ✅ call correct gateway verifier — exhaustive switch covers all enum values
        boolean verified = switch (tx.getPaymentGateway()) {
            case ESEWA -> esewaService.verifyPayment(
                    tx.getReferenceId(),
                    tx.getAmountNpr(),
                    request.getGatewayResponseData()
            );
            case KHALTI -> khaltiService.verifyPayment(
                    tx.getGatewayTransactionId(),   // pidx stored at initiation
                    tx.getAmountNpr() * 100L        // NPR → paisa
            );
            case BANK_TRANSFER -> throw new UnsupportedOperationException(
                    "Bank transfer verification not implemented yet"
            );
        };

        if (verified) {
            // ✅ mark transaction SUCCESS
            tx.setPaymentStatus(PaymentStatus.SUCCESS);
            tx.setGatewayTransactionId(request.getGatewayTransactionId());
            tx.setGatewayResponse(request.getGatewayResponseData());
            tx.setCompletedAt(LocalDateTime.now());
            log.info("Payment verified SUCCESS: ref={}", tx.getReferenceId());

            // ✅ activate subscription for 1 month
            Subscription sub = tx.getSubscription();
            sub.setSubscriptionStatus(SubscriptionStatus.ACTIVE);
            sub.setCurrentPeriodStart(LocalDateTime.now());
            sub.setCurrentPeriodEnd(LocalDateTime.now().plusMonths(1));
            subscriptionRepository.save(sub);
            log.info("Subscription activated: subId={} until={}",
                    sub.getId(), sub.getCurrentPeriodEnd());

        } else {
            // ✅ mark transaction FAILED
            tx.setPaymentStatus(PaymentStatus.FAILED);
            log.warn("Payment verification FAILED: ref={} gateway={}",
                    tx.getReferenceId(), tx.getPaymentGateway());
        }

        return paymentMapper.toResponse(transactionRepository.save(tx));
    }

}
