package com.servicelink.core.controller.business;

import com.servicelink.core.dto.request.business.PaymentInitiateRequest;
import com.servicelink.core.dto.request.business.PaymentVerifyRequest;
import com.servicelink.core.dto.request.business.SubscriptionRequest;
import com.servicelink.core.dto.response.business.PaymentInitiateResponse;
import com.servicelink.core.dto.response.business.PaymentTransactionResponse;
import com.servicelink.core.dto.response.business.SubscriptionResponse;
import com.servicelink.core.payment.service.PaymentService;
import com.servicelink.core.service.business.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;


import java.util.Base64;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/business/payment")
public class PaymentController {

    private final PaymentService paymentService;
    private final SubscriptionService subscriptionService;
    private final ObjectMapper objectMapper;

    //Create Subscription
    @PostMapping("/subscription")
    public ResponseEntity<SubscriptionResponse> createSubscription(@Valid @RequestBody SubscriptionRequest request){
        return ResponseEntity.status(HttpStatus.CREATED).body(subscriptionService.create(request));
    }

    //Initiate Payment - returns gatewayRedirectUrl
    @PostMapping("/initiate")
    public ResponseEntity<PaymentInitiateResponse> initiate(
            @Valid @RequestBody PaymentInitiateRequest request
            ) throws Exception{
        return ResponseEntity.ok(paymentService.initiatePayment(request));
    }

    //Esewa callback GET /api/payment/esewa/callback?data=<base64 JSON>
    @GetMapping("/esewa/callback")
    public ResponseEntity<PaymentTransactionResponse> esewaCallback(
            @RequestParam String data
    )throws Exception{
        byte[] decoded = Base64.getDecoder().decode(data);
        JsonNode json = objectMapper.readTree(decoded);

        String referenceId = json.get("transaction_uuid").asText();
        String gatewayId = json.get("transaction_id").asText();
        String status = json.get("status").asText();

        log.info("eSewa callback: ref={} status={}", referenceId, status);

        if (!"COMPLETE".equalsIgnoreCase(status)){
            log.warn("eSewa payment not complete: ref={} status={}", referenceId, status);
            return ResponseEntity.badRequest().build();
        }

        PaymentVerifyRequest verify = new PaymentVerifyRequest();
        verify.setReferenceId(referenceId);
        verify.setGatewayTransactionId(gatewayId);

        return ResponseEntity.ok(paymentService.verifyAndComplete(verify));

    }

    //Khalti callback GET /api/payment/khalti/callback?pidx=X&status=Completed&purchase_order_id=Y
    @GetMapping("/khalti/callback")
    public ResponseEntity<PaymentTransactionResponse> khaltiCallback(
            @RequestParam String pidx,
            @RequestParam String status,
            @RequestParam ("purchase_order_id") String purchaseOrderId
    ) throws Exception{
        log.info("Khalti callback: ref={} pidx={} status={}", purchaseOrderId, pidx, status);

        if (!"Completed".equalsIgnoreCase(status)){
            log.warn("Khalti payment not completed: ref={} status={}", purchaseOrderId, status);
            return ResponseEntity.badRequest().build();
        }

        PaymentVerifyRequest verify = new PaymentVerifyRequest();
        verify.setReferenceId(purchaseOrderId);
        verify.setGatewayTransactionId(pidx);

        return ResponseEntity.ok(paymentService.verifyAndComplete(verify));
    }

    @PostMapping("/verify")
    public ResponseEntity<PaymentTransactionResponse> verify(
            @RequestBody PaymentVerifyRequest request
    )throws Exception{
        log.info("Manual verify requested: ref={}", request.getReferenceId());
        return ResponseEntity.ok(paymentService.verifyAndComplete(request));
    }
    
}
