package com.servicelink.core.service.provider;

import com.servicelink.core.dto.response.provider.*;
import com.servicelink.core.exception.BusinessException;
import com.servicelink.core.exception.ResourceNotFoundException;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.provider.ProviderDevicePin;
import com.servicelink.core.repository.provider.ProviderDevicePinRepository;
import com.servicelink.core.repository.appointment.ProviderRepository;
import com.servicelink.core.security.JwtService;
import com.servicelink.core.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    // ── Check device ─────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public CheckDeviceResponseDTO checkDevice(String deviceId) {
        return CheckDeviceResponseDTO.builder()
                .pinExists(pinRepo.existsByDeviceId(deviceId))
                .build();
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
        pinRepo.save(devicePin);

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

    // ── Verify PIN — the fast daily path ────────────────────────────────────
    @Transactional
    public VerifyPinResponseDTO verifyPin(String deviceId, String pin) {
        if (pinAttemptService.isLockedOut(deviceId)) {
            return VerifyPinResponseDTO.builder()
                    .verified(false)
                    .message("Too many attempts. Please log in with a code.")
                    .attemptsLeft(0)
                    .build();
        }

        ProviderDevicePin devicePin = pinRepo.findByDeviceId(deviceId).orElse(null);
        if (devicePin == null || !passwordEncoder.matches(pin, devicePin.getPinHash())) {
            int remaining = pinAttemptService.recordFailure(deviceId);
            return VerifyPinResponseDTO.builder()
                    .verified(false)
                    .message("Incorrect PIN.")
                    .attemptsLeft(remaining)
                    .build();
        }

        pinAttemptService.resetOnSuccess(deviceId);
        devicePin.setLastUsedAt(Instant.now());
        pinRepo.save(devicePin);

        SetPinResponseDTO session = issueSession(devicePin.getProvider().getUser().getEmail());
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

        String accessToken = jwtService.generateAccessToken(
                provider.getUser().getEmail(), provider.getUser().getRole());
        String refreshToken = jwtService.generateRefreshToken(provider.getUser().getEmail());

        String jti = jwtService.extractJti(refreshToken);
        refreshTokenService.store(
                provider.getUser().getEmail(),
                jti,
                refreshToken,
                jwtService.getRefreshTokenExpirationMillis());

        return SetPinResponseDTO.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }
}
