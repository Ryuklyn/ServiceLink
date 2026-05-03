package com.servicelink.core.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Phone OTP delivery service.
 *
 * Delivery priority:
 *  1. Sparrow SMS (if credentials present)
 *  2. WhatsApp deep-link fallback (always available)
 *
 * The WhatsApp link encodes the OTP into a pre-filled message so the user
 * can tap the link, see the OTP in the WhatsApp chat compose box, then
 * note it down and enter it on the verification screen.
 *
 * When Sparrow SMS credentials arrive, set the env vars and the service
 * will automatically upgrade to real SMS delivery.
 */
@Service
public class PhoneOtpService {

    private static final Logger log = LoggerFactory.getLogger(PhoneOtpService.class);

    /** Your Sparrow SMS token — set in .env once received */
    @Value("${sparrow.sms.token:}")
    private String sparrowToken;

    /** Your Sparrow SMS sender ID */
    @Value("${sparrow.sms.from:ServiceLink}")
    private String sparrowFrom;

    /** WhatsApp Business number (with country code, no +) */
    @Value("${whatsapp.business.number:}")
    private String whatsappBusinessNumber;

    private final HttpClientService httpClientService;

    public PhoneOtpService(HttpClientService httpClientService) {
        this.httpClientService = httpClientService;
    }

    /**
     * Sends an OTP to the given E.164 phone number.
     *
     * @param phone E.164 phone (e.g. +9779812345678)
     * @param otp   6-digit OTP string
     * @return a {@link SendResult} describing what delivery method was used
     *         and (if WhatsApp) the deep-link the frontend should surface.
     */
    public SendResult sendOtp(String phone, String otp) {
        if (isSparrowConfigured()) {
            return sendViaSparrow(phone, otp);
        }
        return buildWhatsAppFallback(phone, otp);
    }

    // ─── Sparrow SMS ──────────────────────────────────────────────────────────

    private boolean isSparrowConfigured() {
        return sparrowToken != null && !sparrowToken.isBlank();
    }

    private SendResult sendViaSparrow(String phone, String otp) {
        try {
            String text = "Your ServiceLink OTP is: " + otp + ". Valid for 10 minutes. Do not share.";

            // Sparrow SMS REST API  (https://sparrowsms.com/api)
            String encodedText = java.net.URLEncoder.encode(text, java.nio.charset.StandardCharsets.UTF_8);
            String url = "https://api.sparrowsms.com/v2/sms/"
                    + "?auth_token=" + java.net.URLEncoder.encode(sparrowToken, java.nio.charset.StandardCharsets.UTF_8)
                    + "&from="       + java.net.URLEncoder.encode(sparrowFrom,   java.nio.charset.StandardCharsets.UTF_8)
                    + "&to="         + java.net.URLEncoder.encode(phone,         java.nio.charset.StandardCharsets.UTF_8)
                    + "&text="       + encodedText;

            httpClientService.get(url);   // Sparrow uses GET requests
            log.info("Sparrow SMS sent to [{}]", mask(phone));
            return new SendResult(DeliveryMethod.SMS, null);

        } catch (Exception ex) {
            log.error("Sparrow SMS failed for [{}], falling back to WhatsApp: {}", mask(phone), ex.getMessage());
            return buildWhatsAppFallback(phone, otp);
        }
    }

    // ─── WhatsApp deep-link fallback ──────────────────────────────────────────

    /**
     * Builds a wa.me deep link that opens WhatsApp on the user's device
     * with a pre-filled message containing the OTP.
     *
     * If a business number is configured the link messages THAT number
     * (e.g. your support line). Otherwise it messages the user themselves
     * so they can see the code in the compose box.
     */
    private SendResult buildWhatsAppFallback(String phone, String otp) {
        String target = whatsappBusinessNumber != null && !whatsappBusinessNumber.isBlank()
                ? whatsappBusinessNumber
                : phone.replaceAll("[^\\d]", "");   // strip + from E.164

        String message = "Your ServiceLink OTP is: " + otp + ". Valid for 10 minutes.";
        String encoded = URLEncoder.encode(message, StandardCharsets.UTF_8);
        String link    = "https://wa.me/" + target + "?text=" + encoded;

        log.info("WhatsApp OTP link generated for [{}]", mask(phone));
        return new SendResult(DeliveryMethod.WHATSAPP_LINK, link);
    }

    // ─── Value types ──────────────────────────────────────────────────────────

    public enum DeliveryMethod { SMS, WHATSAPP_LINK }

    public record SendResult(DeliveryMethod method, String whatsappLink) {
        public boolean isWhatsApp() { return method == DeliveryMethod.WHATSAPP_LINK; }
    }

    private static String mask(String s) {
        if (s == null || s.length() <= 4) return "***";
        return s.substring(0, 4) + "***";
    }
}
