package com.servicelink.core.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

/**
 * Phone OTP delivery service.
 *
 * Delivery priority:
 *  1. Twilio WhatsApp API (if credentials present) — sends OTP directly,
 *     fully automated, no manual user action required.
 *  2. wa.me deep-link fallback (last resort, e.g. Twilio not configured yet).
 */
@Service
public class PhoneOtpService {

    private static final Logger log = LoggerFactory.getLogger(PhoneOtpService.class);

    @Value("${twilio.account.sid:}")
    private String twilioAccountSid;

    @Value("${twilio.auth.token:}")
    private String twilioAuthToken;

    @Value("${twilio.whatsapp.from:whatsapp:+14155238886}")
    private String twilioWhatsappFrom;

    @Value("${twilio.whatsapp.content-sid:}")
    private String twilioContentSid;

    @PostConstruct
    private void initTwilio() {
        if (isTwilioConfigured()) {
            Twilio.init(twilioAccountSid, twilioAuthToken);
            log.info("Twilio WhatsApp client initialized");
        }
    }

    /**
     * Sends an OTP to the given E.164 phone number.
     */
    public SendResult sendOtp(String phone, String otp) {
        if (isTwilioConfigured()) {
            return sendViaTwilioWhatsApp(phone, otp);
        }
        return buildWhatsAppFallback(phone, otp);
    }

    // ─── Twilio WhatsApp API ──────────────────────────────────────────────────

    private boolean isTwilioConfigured() {
        return twilioAccountSid != null && !twilioAccountSid.isBlank()
                && twilioAuthToken != null && !twilioAuthToken.isBlank();
    }

    /**
     * Sends the OTP directly via Twilio's WhatsApp API using the
     * pre-approved "Verification Codes" content template.
     * No manual user action needed — message arrives automatically.
     */
    private SendResult sendViaTwilioWhatsApp(String phone, String otp) {
        try {
            String toWhatsApp = "whatsapp:" + phone; // phone already E.164, e.g. +9779861360454

            Map<String, String> contentVariables = new HashMap<>();
            contentVariables.put("1", otp);

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            String contentVariablesJson = mapper.writeValueAsString(contentVariables);

            Message message = Message.creator(
                            new PhoneNumber(toWhatsApp),
                            new PhoneNumber(twilioWhatsappFrom),
                            "Your ServiceLink OTP is: " + otp + ". Valid for 10 minutes." // fallback body
                    )
                    .setContentSid(twilioContentSid)
                    .setContentVariables(contentVariablesJson)
                    .create();

            log.info("Twilio WhatsApp OTP sent to [{}], SID: {}", mask(phone), message.getSid());
            return new SendResult(DeliveryMethod.WHATSAPP_API, null);

        } catch (Exception ex) {
            log.error("Twilio WhatsApp failed for [{}], falling back to deep-link: {}", mask(phone), ex.getMessage());
            return buildWhatsAppFallback(phone, otp);
        }
    }

    // ─── wa.me deep-link fallback (last resort) ────────────────────────────────

    private SendResult buildWhatsAppFallback(String phone, String otp) {
        String target = phone.replaceAll("[^\\d]", "");
        String message = "Your ServiceLink OTP is: " + otp + ". Valid for 10 minutes.";
        String encoded = java.net.URLEncoder.encode(message, java.nio.charset.StandardCharsets.UTF_8);
        String link = "https://wa.me/" + target + "?text=" + encoded;

        log.info("WhatsApp deep-link fallback generated for [{}]", mask(phone));
        return new SendResult(DeliveryMethod.WHATSAPP_LINK, link);
    }

    // ─── Value types ──────────────────────────────────────────────────────────

    public enum DeliveryMethod { WHATSAPP_API, WHATSAPP_LINK }

    public record SendResult(DeliveryMethod method, String whatsappLink) {
        public boolean isWhatsApp() { return method == DeliveryMethod.WHATSAPP_LINK; }
        public boolean isAutomated() { return method == DeliveryMethod.WHATSAPP_API; }
    }

    private static String mask(String s) {
        if (s == null || s.length() <= 4) return "***";
        return s.substring(0, 4) + "***";
    }

    /**
     * Sends a plain freeform WhatsApp text (not an OTP) — used for
     * security/audit alerts like "your phone number was changed".
     */
    public void sendPlainAlert(String phone, String text) {
        if (!isTwilioConfigured()) {
            log.info("Twilio not configured — skipping audit alert to [{}]", mask(phone));
            return;
        }
        try {
            Message.creator(
                    new PhoneNumber("whatsapp:" + phone),
                    new PhoneNumber(twilioWhatsappFrom),
                    text
            ).create();
        } catch (Exception ex) {
            log.error("Failed to send audit alert to [{}]: {}", mask(phone), ex.getMessage());
        }
    }
}