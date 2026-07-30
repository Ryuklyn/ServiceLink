package com.servicelink.core.mapper.business;

import com.servicelink.core.dto.response.business.PaymentTransactionResponse;
import com.servicelink.core.model.business.ProPaymentTransaction;
import org.springframework.stereotype.Component;

@Component
public class ProPaymentMapper {
    public PaymentTransactionResponse toResponse(ProPaymentTransaction paymentTransaction){
        return PaymentTransactionResponse.builder()
                .id(paymentTransaction.getId())
                .referenceId(paymentTransaction.getReferenceId())
                .gatewayTransactionId(paymentTransaction.getGatewayTransactionId())
                .gateway(paymentTransaction.getPaymentGateway())
                .status(paymentTransaction.getPaymentStatus())
                .amountNpr(paymentTransaction.getAmountNpr())
                .initiatedAt(paymentTransaction.getInitiatedAt())
                .completedAt(paymentTransaction.getCompletedAt())
                .build();
    }
}