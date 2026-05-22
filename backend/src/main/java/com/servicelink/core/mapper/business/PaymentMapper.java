package com.servicelink.core.mapper.business;

import com.servicelink.core.dto.response.business.PaymentTransactionResponse;
import com.servicelink.core.model.business.PaymentTransaction;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {
    public PaymentTransactionResponse toResponse(PaymentTransaction paymentTransaction){
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
