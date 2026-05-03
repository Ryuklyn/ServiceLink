package com.servicelink.core.service;

import com.servicelink.core.model.OtpEntry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Generic OTP service keyed by any string identifier (phone in E.164, email, etc.).
 * TTL = 10 minutes to match the frontend countdown.
 * Resend rate-limit = max 3 per identifier per TTL window.
 */
@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    public static final long OTP_TTL_SECONDS = 600;          // 10 min — matches frontend
    private static final int  MAX_RESENDS     = 3;
    private static final SecureRandom RANDOM  = new SecureRandom();

    // key → OtpEntry (otp, expiry, sendCount)
    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();

    // ─── Generate ─────────────────────────────────────────────────────────────

    /**
     * Generates a 6-digit OTP for the given key.
     * Enforces MAX_RESENDS within the active TTL window.
     *
     * @param key phone (E.164) or email
     * @return the generated OTP string
     * @throws IllegalStateException if resend limit is exceeded
     */
    public String generateOtp(String key) {
        OtpEntry existing = store.get(key);

        // Enforce resend limit if a non-expired entry exists
        if (existing != null && Instant.now().isBefore(existing.expiresAt())) {
            if (existing.sendCount() >= MAX_RESENDS) {
                throw new IllegalStateException(
                    "OTP resend limit reached. Please wait before requesting again.");
            }
            int newCount = existing.sendCount() + 1;
            String otp = generateDigits();
            store.put(key, new OtpEntry(otp, Instant.now().plusSeconds(OTP_TTL_SECONDS), newCount));
            log.info("OTP regenerated for key [{}] (resend #{}/{})", mask(key), newCount, MAX_RESENDS);
            return otp;
        }

        // Fresh OTP
        String otp = generateDigits();
        store.put(key, new OtpEntry(otp, Instant.now().plusSeconds(OTP_TTL_SECONDS), 1));
        log.info("OTP generated for key [{}]", mask(key));
        return otp;
    }

    // ─── Verify ───────────────────────────────────────────────────────────────

    /**
     * Verifies the OTP for the given key.
     * On success the entry is removed (one-time use).
     *
     * @return true if valid, false otherwise
     */
    public boolean verifyOtp(String key, String otp) {
        OtpEntry entry = store.get(key);
        if (entry == null) {
            log.warn("OTP verify failed for [{}]: no entry found", mask(key));
            return false;
        }
        if (Instant.now().isAfter(entry.expiresAt())) {
            store.remove(key);
            log.warn("OTP verify failed for [{}]: expired", mask(key));
            return false;
        }
        if (!entry.otp().equals(otp)) {
            log.warn("OTP verify failed for [{}]: wrong code", mask(key));
            return false;
        }
        store.remove(key);   // one-time use
        log.info("OTP verified for [{}]", mask(key));
        return true;
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public void clearOtp(String key) {
        store.remove(key);
    }

    private static String generateDigits() {
        return String.format("%06d", RANDOM.nextInt(1_000_000));
    }

    /** Mask the key for safe logging (show first 4 chars only). */
    private static String mask(String key) {
        if (key == null || key.length() <= 4) return "***";
        return key.substring(0, 4) + "***";
    }
}