package com.servicelink.core.service.provider.pin;

import com.servicelink.core.dto.response.provider.*;
import com.servicelink.core.exception.ResourceNotFoundException;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.provider.pin.ProviderDevicePin;
import com.servicelink.core.repository.provider.pin.ProviderDevicePinRepository;
import com.servicelink.core.repository.provider.ProviderRepository;
import com.servicelink.core.security.JwtService;
import com.servicelink.core.dto.request.provider.CheckAccountRequestDTO;
import com.servicelink.core.dto.request.provider.VerifyPinRequestDTO;
import com.servicelink.core.service.RefreshTokenService;
import com.servicelink.core.service.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProviderPinService {

    private final ProviderDevicePinRepository pinRepo;
    private final ProviderRepository providerRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final PinAttemptService pinAttemptService;
    private final SessionService sessionService;

    // ── Check device ─────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public CheckDeviceResponseDTO checkDevice(String deviceId) {
        return CheckDeviceResponseDTO.builder()
                .pinExists(pinRepo.existsByDeviceId(deviceId))
                .build();
    }

    // ── Check account status (PIN existence & masked contact) ────────────────
    @Transactional(readOnly = true)
    public CheckAccountResponseDTO checkAccount(CheckAccountRequestDTO req) {
        Provider provider = null;
        String contactValue = null;
        boolean isEmail = false;

        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            provider = providerRepo.findByUser_Email(req.getEmail()).orElse(null);
            contactValue = req.getEmail();
            isEmail = true;
        } else if (req.getPhone() != null && !req.getPhone().isBlank()) {
            provider = providerRepo.findByPhone(req.getPhone()).orElse(null);
            contactValue = req.getPhone();
        }

        if (provider == null) {
            throw new ResourceNotFoundException("No registered provider account found.");
        }

        boolean pinExists = pinRepo.existsByProvider_Id(provider.getId());
        String masked = isEmail ? maskEmail(contactValue) : maskPhone(contactValue);

        return CheckAccountResponseDTO.builder()
                .pinExists(pinExists)
                .maskedContact(masked)
                .email(provider.getUser().getEmail())
                .build();
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        int idx = email.indexOf("@");
        String name = email.substring(0, idx);
        String domain = email.substring(idx);
        if (name.length() <= 2) return "**" + domain;
        return name.substring(0, 2) + "****" + domain;
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) return phone;
        return phone.substring(0, 2) + "****" + phone.substring(phone.length() - 2);
    }

    // ── Set PIN (or overwrite, e.g. after forgot-PIN) ───────────────────────
    @Transactional
    public SetPinResponseDTO setPin(String providerEmail, String deviceId, String pin) {
        Provider provider = providerRepo.findByUser_Email(providerEmail)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Provider not found for email: " + providerEmail));

        String hash = passwordEncoder.encode(pin);

        ProviderDevicePin devicePin = pinRepo
                .findByProvider_IdAndDeviceId(provider.getId(), deviceId)
                .orElse(ProviderDevicePin.builder()
                        .provider(provider)
                        .deviceId(deviceId)
                        .build());

        devicePin.setPinHash(hash);
        devicePin.setLastUsedAt(Instant.now());
        devicePin.setExpiresAt(Instant.now().plus(Duration.ofDays(ProviderDevicePin.PIN_TTL_DAYS)));
        pinRepo.save(devicePin);

        // Sync all other device mappings of this provider to use the new PIN hash
        java.util.List<ProviderDevicePin> existingPins = pinRepo.findByProvider_Id(provider.getId());
        for (ProviderDevicePin otherPin : existingPins) {
            if (!otherPin.getDeviceId().equals(deviceId)) {
                otherPin.setPinHash(hash);
                pinRepo.save(otherPin);
            }
        }

        pinAttemptService.resetOnSuccess(deviceId); // clear any stale lockout
        log.info("Provider {} set PIN for device {}", provider.getId(), deviceId);

        return issueSession(provider.getUser().getEmail());
    }

    // ── Skip PIN — just exchange providerToken for a real session ──────────
    @Transactional(readOnly = true)
    public SetPinResponseDTO skipPin(String providerEmail) {
        Provider provider = providerRepo.findByUser_Email(providerEmail)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Provider not found for email: " + providerEmail));
        return issueSession(provider.getUser().getEmail());
    }

    // ── Verify PIN — the fast daily path (and new device verify with providerEmail / req contact info) ──
    @Transactional
    public VerifyPinResponseDTO verifyPin(String providerEmail, VerifyPinRequestDTO req) {
        String deviceId = req.getDeviceId();
        String pin = req.getPin();

        if (pinAttemptService.isLockedOut(deviceId)) {
            return VerifyPinResponseDTO.builder()
                    .verified(false)
                    .message("Too many attempts. Please log in with a code.")
                    .attemptsLeft(0)
                    .build();
        }

        // 1. Resolve Provider and their PIN hash
        Provider provider = null;
        String pinHash = null;

        String resolvedEmail = providerEmail;
        if (resolvedEmail == null || resolvedEmail.isBlank()) {
            if (req.getEmail() != null && !req.getEmail().isBlank()) {
                resolvedEmail = req.getEmail();
            } else if (req.getPhone() != null && !req.getPhone().isBlank()) {
                Provider p = providerRepo.findByPhone(req.getPhone()).orElse(null);
                if (p != null) {
                    resolvedEmail = p.getUser().getEmail();
                }
            }
        }

        if (resolvedEmail != null && !resolvedEmail.isBlank()) {
            provider = providerRepo.findByUser_Email(resolvedEmail).orElse(null);
            if (provider != null) {
                // Get PIN hash from any existing device mapping
                ProviderDevicePin existing = pinRepo.findFirstByProvider_Id(provider.getId()).orElse(null);
                if (existing != null) {
                    pinHash = existing.getPinHash();
                }
            }
        } else {
            // Daily fast path (no providerToken / email): identify by deviceId
            ProviderDevicePin devicePin = pinRepo.findByDeviceId(deviceId).orElse(null);
            if (devicePin != null) {
                provider = devicePin.getProvider();
                pinHash = devicePin.getPinHash();
                if (devicePin.isExpired()) {
                    return VerifyPinResponseDTO.builder()
                            .verified(false)
                            .expired(true)
                            .message("Your PIN has expired. Please log in with a code.")
                            .build();
                }
            }
        }

        if (provider == null || pinHash == null) {
            int remaining = pinAttemptService.recordFailure(deviceId);
            return VerifyPinResponseDTO.builder()
                    .verified(false)
                    .message("Incorrect PIN.")
                    .attemptsLeft(remaining)
                    .build();
        }

        // 2. Validate PIN
        if (!passwordEncoder.matches(pin, pinHash)) {
            int remaining = pinAttemptService.recordFailure(deviceId);
            return VerifyPinResponseDTO.builder()
                    .verified(false)
                    .message("Incorrect PIN.")
                    .attemptsLeft(remaining)
                    .build();
        }

        // 3. Register device if not already registered
        ProviderDevicePin devicePin = pinRepo.findByProvider_IdAndDeviceId(provider.getId(), deviceId).orElse(null);
        if (devicePin == null) {
            devicePin = ProviderDevicePin.builder()
                    .provider(provider)
                    .deviceId(deviceId)
                    .pinHash(pinHash)
                    .expiresAt(Instant.now().plus(Duration.ofDays(ProviderDevicePin.PIN_TTL_DAYS)))
                    .build();
            pinRepo.save(devicePin);
        } else {
            devicePin.setLastUsedAt(Instant.now());
            pinRepo.save(devicePin);
        }

        pinAttemptService.resetOnSuccess(deviceId);

        // 4. Issue the new single active session!
        SetPinResponseDTO session = issueSession(provider.getUser().getEmail());

        return VerifyPinResponseDTO.builder()
                .verified(true)
                .message("Login successful")
                .accessToken(session.getAccessToken())
                .refreshToken(session.getRefreshToken())
                .build();
    }

    // ── Shared token issuance — mirrors AuthService.login() exactly ────────
    private SetPinResponseDTO issueSession(String email) {
        Provider provider = providerRepo.findByUser_Email(email)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        String refreshToken = jwtService.generateRefreshToken(provider.getUser().getEmail());
        String jti = jwtService.extractJti(refreshToken);
        String accessToken = jwtService.generateAccessToken(
                provider.getUser().getEmail(), provider.getUser().getRole(), jti);

        refreshTokenService.store(
                provider.getUser().getEmail(),
                jti,
                refreshToken,
                jwtService.getRefreshTokenExpirationMillis());

        sessionService.registerSession(
                provider.getUser().getId(),
                provider.getUser().getEmail(),
                jti,
                jwtService.getRefreshTokenExpirationMillis());

        return SetPinResponseDTO.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }
}
