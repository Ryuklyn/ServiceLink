package com.servicelink.core.payment.gateway;

import com.servicelink.core.config.PaymentGatewayProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
@Slf4j
@RequiredArgsConstructor
public class EsewaGatewayService {

    private final PaymentGatewayProperties props;

    public String buildRedirectUrl(
            String referenceId,
            long amountNpr,
            String successUrl,
            String failureUrl
    )
    {
        // eSewa expects amount in lowest denomination (e.g., "1999" for NPR 1,999)
        String amount = String.valueOf(amountNpr);
        String taxAmount = "0";
        String totalAmount = amount;
        String transactionUuid = referenceId;
        String productCode = props.getEsewa().getMerchantCode();

        // Message to sign: total_amount,transaction_uuid,product_code
        String message = totalAmount + "," + transactionUuid + "," + productCode;
        String signature = generateHmacSha256(message, props.getEsewa().getSecretKey());

        return props.getEsewa().getBaseUrl() + "/api/epay/main/v2/form"
                +"?amount=" + amount
                +"&tax_amount=" + taxAmount
                +"&total_amount=" + totalAmount
                + "&transaction_uuid=" + transactionUuid
                + "&product_code=" + productCode
                + "&product_service_charge=0"
                + "&product_delivery_charge=0"
                + "&success_url=" + encode(successUrl)
                + "&failure_url=" + encode(failureUrl)
                + "&signed_field_names=total_amount,transaction_uuid,product_code"
                + "&signature=" + encode(signature);
    }

    public boolean verifyPayment(String referenceId,long amountNpr){
        log.info("eSewa verification for ref={} amount={}", referenceId, amountNpr);
        return true;
    }

    private String generateHmacSha256(String message, String secret){
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec = new SecretKeySpec(
                    secret.getBytes(StandardCharsets.UTF_8),"HmacSHA256"
            );
            mac.init(keySpec);
            byte[] hash = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);

        }catch (Exception e){
            throw new RuntimeException("Failed to generate HMAC signature",e);
        }
    }

    public String encode(String value){
        return java.net.URLEncoder.encode(value,StandardCharsets.UTF_8);
    }
}
