package com.servicelink.core.service.business;

import com.servicelink.core.dto.request.business.PaymentInitiateRequest;
import com.servicelink.core.dto.request.business.PaymentVerifyRequest;
import com.servicelink.core.dto.response.business.PaymentInitiateResponse;
import com.servicelink.core.dto.response.business.PaymentTransactionResponse;
import com.servicelink.core.mapper.business.PaymentMapper;
import com.servicelink.core.mapper.business.ProPaymentMapper;
import com.servicelink.core.model.business.*;
import com.servicelink.core.payment.gateway.EsewaGatewayService;
import com.servicelink.core.payment.gateway.KhaltiGatewayService;
import com.servicelink.core.repository.business.ProPaymentTransactionRepository;
import com.servicelink.core.repository.business.SubscriptionRepository;
import com.servicelink.core.service.business.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionPaymentService {

    // ── Dedicated to business subscriptions — NOT the provider PaymentService ──
    private final SubscriptionRepository subscriptionRepository;
    private final ProPaymentTransactionRepository proPaymentTransactionRepository; // ← was wrongly typed as the entity itself
    private final SubscriptionService subscriptionService; // reuse activateAfterPayment()
    private final EsewaGatewayService esewaGatewayService;
    private final KhaltiGatewayService khaltiGatewayService;
    private final ProPaymentMapper paymentMapper;

    @Transactional
    public PaymentInitiateResponse initiatePayment(PaymentInitiateRequest request) throws Exception {
        Subscription subscription = subscriptionRepository.findById(request.getSubscriptionId())
                .orElseThrow(() -> new RuntimeException("Subscription not found: " + request.getSubscriptionId()));

        PlanType targetPlan = PlanPricing.resolvePlanForAmount(request.getAmountNpr());
        long amountNpr = PlanPricing.PRICE_NPR.get(targetPlan);

        String referenceId = generateReferenceId();

        ProPaymentTransaction txn = ProPaymentTransaction.builder()
                .subscription(subscription)
                .referenceId(referenceId)
                .paymentGateway(request.getPaymentGateway())
                .paymentStatus(PaymentStatus.INITIATED)
                .amountNpr(amountNpr)
                .targetPlanType(targetPlan)
                .build();

        return switch (request.getPaymentGateway()) {
            case ESEWA -> {
                proPaymentTransactionRepository.save(txn);
                var form = esewaGatewayService.buildPaymentForm(
                        referenceId, amountNpr, request.getSuccessUrl(), request.getFailureUrl());
                yield PaymentInitiateResponse.builder()
                        .referenceId(referenceId)
                        .gatewayRedirectUrl(form.actionUrl())
                        .gatewayMethod("POST")
                        .gatewayFormFields(form.fields())
                        .gateway("ESEWA")
                        .status("INITIATED")
                        .build();
            }
            case KHALTI -> {
                long amountPaisa = amountNpr * 100;
                var result = khaltiGatewayService.initiatePayment(
                        referenceId, amountPaisa, targetPlan.name() + " Plan", request.getSuccessUrl());
                txn.setGatewayTransactionId(result.pidx());
                proPaymentTransactionRepository.save(txn);
                yield PaymentInitiateResponse.builder()
                        .referenceId(referenceId)
                        .gatewayRedirectUrl(result.paymentUrl())
                        .gatewayMethod("GET")
                        .gatewayFormFields(null)
                        .gateway("KHALTI")
                        .status("INITIATED")
                        .build();
            }
            default -> throw new IllegalArgumentException("Unsupported payment gateway: " + request.getPaymentGateway());
        };
    }

    @Transactional
    public PaymentTransactionResponse verifyAndComplete(PaymentVerifyRequest request) throws Exception {
        ProPaymentTransaction txn = proPaymentTransactionRepository.findByReferenceId(request.getReferenceId())
                .orElseThrow(() -> new RuntimeException("Transaction not found: " + request.getReferenceId()));

        if (txn.getPaymentStatus() == PaymentStatus.SUCCESS) {
            return paymentMapper.toResponse(txn);
        }

        boolean verified = switch (txn.getPaymentGateway()) {
            case ESEWA -> esewaGatewayService.verifyPayment(
                    txn.getReferenceId(), txn.getAmountNpr(), request.getGatewayResponseData());
            case KHALTI -> khaltiGatewayService.verifyPayment(
                    request.getGatewayTransactionId() != null ? request.getGatewayTransactionId() : txn.getGatewayTransactionId(),
                    txn.getAmountNpr() * 100);
            default -> throw new IllegalArgumentException("Unsupported payment gateway: " + txn.getPaymentGateway());
        };

        if (!verified) {
            txn.setPaymentStatus(PaymentStatus.FAILED);
            proPaymentTransactionRepository.save(txn); // ← was the stale `paymentTransactionRepository`
            throw new RuntimeException("Payment verification failed for ref: " + txn.getReferenceId());
        }

        txn.setPaymentStatus(PaymentStatus.SUCCESS);
        txn.setCompletedAt(LocalDateTime.now());
        if (request.getGatewayTransactionId() != null) {
            txn.setGatewayTransactionId(request.getGatewayTransactionId());
        }
        proPaymentTransactionRepository.save(txn); // ← was the stale `paymentTransactionRepository`

        subscriptionService.activateAfterPayment(
                txn.getSubscription().getId(), txn.getTargetPlanType(), txn.getAmountNpr());

        return paymentMapper.toResponse(txn);
    }

    private String generateReferenceId() {
        return "SLP-PAY-" + System.currentTimeMillis();
    }
}