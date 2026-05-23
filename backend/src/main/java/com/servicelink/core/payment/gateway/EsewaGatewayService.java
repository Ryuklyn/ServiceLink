package com.servicelink.core.payment.gateway;

import com.servicelink.core.config.PaymentGatewayProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class EsewaGatewayService {

    private final PaymentGatewayProperties props;
    private final ObjectMapper objectMapper;

    public record EsewaPaymentForm(String actionUrl, Map<String, String> fields) {}

    public EsewaPaymentForm buildPaymentForm(
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
        String message = "total_amount=" + totalAmount
                + ",transaction_uuid=" + transactionUuid
                + ",product_code=" + productCode;
        String signature = generateHmacSha256(message, props.getEsewa().getSecretKey());

        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("amount", amount);
        fields.put("tax_amount", taxAmount);
        fields.put("total_amount", totalAmount);
        fields.put("transaction_uuid", transactionUuid);
        fields.put("product_code", productCode);
        fields.put("product_service_charge", "0");
        fields.put("product_delivery_charge", "0");
        fields.put("success_url", successUrl);
        fields.put("failure_url", failureUrl);
        fields.put("signed_field_names", "total_amount,transaction_uuid,product_code");
        fields.put("signature", signature);

        return new EsewaPaymentForm(
                props.getEsewa().getBaseUrl() + "/api/epay/main/v2/form",
                fields
        );
    }

    public boolean verifyPayment(String referenceId, long amountNpr, String encodedResponseData) {
        try {
            if (encodedResponseData == null || encodedResponseData.isBlank()) {
                log.warn("Missing eSewa callback data for ref={}", referenceId);
                return false;
            }

            JsonNode json = objectMapper.readTree(decodeBase64(encodedResponseData));
            String status = text(json, "status");
            String transactionUuid = text(json, "transaction_uuid");
            String productCode = text(json, "product_code");
            String signedFieldNames = text(json, "signed_field_names");
            String gatewaySignature = text(json, "signature");

            if (!"COMPLETE".equalsIgnoreCase(status)) {
                log.warn("eSewa status is not complete: ref={} status={}", referenceId, status);
                return false;
            }
            if (!referenceId.equals(transactionUuid)) {
                log.warn("eSewa reference mismatch: expected={} actual={}", referenceId, transactionUuid);
                return false;
            }
            if (!props.getEsewa().getMerchantCode().equals(productCode)) {
                log.warn("eSewa product code mismatch for ref={}", referenceId);
                return false;
            }
            if (!sameAmount(String.valueOf(amountNpr), text(json, "total_amount"))) {
                log.warn("eSewa amount mismatch for ref={} expected={}", referenceId, amountNpr);
                return false;
            }

            String message = buildSignedMessage(json, signedFieldNames);
            String expectedSignature = generateHmacSha256(message, props.getEsewa().getSecretKey());
            boolean verified = expectedSignature.equals(gatewaySignature);
            if (!verified) {
                log.warn("eSewa signature mismatch for ref={}", referenceId);
            }
            return verified;
        } catch (Exception e) {
            log.warn("Failed to verify eSewa response for ref={}", referenceId, e);
            return false;
        }
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

    private byte[] decodeBase64(String value) {
        try {
            return Base64.getDecoder().decode(value);
        } catch (IllegalArgumentException ignored) {
            return Base64.getUrlDecoder().decode(value);
        }
    }

    private String buildSignedMessage(JsonNode json, String signedFieldNames) {
        StringBuilder message = new StringBuilder();
        String[] fields = signedFieldNames.split(",");
        for (int i = 0; i < fields.length; i++) {
            String field = fields[i].trim();
            if (i > 0) {
                message.append(",");
            }
            message.append(field).append("=").append(text(json, field));
        }
        return message.toString();
    }

    private String text(JsonNode json, String field) {
        JsonNode value = json.get(field);
        return value == null || value.isNull() ? "" : value.asText();
    }

    private boolean sameAmount(String expected, String actual) {
        return new BigDecimal(expected.replace(",", ""))
                .compareTo(new BigDecimal(actual.replace(",", ""))) == 0;
    }
}
