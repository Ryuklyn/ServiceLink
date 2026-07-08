package com.servicelink.core.controller.provider;

import com.servicelink.core.dto.request.provider.*;
import com.servicelink.core.dto.response.provider.*;
import com.servicelink.core.security.JwtService;
import com.servicelink.core.service.provider.pin.ProviderPinService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/providers/auth")
@RequiredArgsConstructor
public class ProviderPinController {

    private final ProviderPinService pinService;
    private final JwtService jwtService;

    /** Public — no auth needed, deviceId alone isn't sensitive. */
    @PostMapping("/check-device")
    public ResponseEntity<CheckDeviceResponseDTO> checkDevice(
            @Valid @RequestBody CheckDeviceRequestDTO req) {
        return ResponseEntity.ok(pinService.checkDevice(req.getDeviceId()));
    }

    /**
     * Called right after OTP verify. Auth is via the short-lived providerToken
     * in X-Provider-Token — same header pattern your statusClient/KycController
     * already use for not-yet-fully-registered callers.
     */
    @PostMapping("/set-pin")
    public ResponseEntity<SetPinResponseDTO> setPin(
            @RequestHeader("X-Provider-Token") String providerToken,
            @Valid @RequestBody SetPinRequestDTO req) {

        String email = jwtService.extractUsername(providerToken);
        return ResponseEntity.ok(pinService.setPin(email, req.getDeviceId(), req.getPin()));
    }

    @PostMapping("/skip-pin")
    public ResponseEntity<SetPinResponseDTO> skipPin(
            @RequestHeader("X-Provider-Token") String providerToken) {

        String email = jwtService.extractUsername(providerToken);
        return ResponseEntity.ok(pinService.skipPin(email));
    }

    /** Public — the fast daily-login path. No providerToken needed at all. */
//    @PostMapping("/verify-pin")
//    public ResponseEntity<VerifyPinResponseDTO> verifyPin(
//            @Valid @RequestBody VerifyPinRequestDTO req) {
//
//        VerifyPinResponseDTO res = pinService.verifyPin(req.getDeviceId(), req.getPin());
//        if (!res.isVerified() && res.getAttemptsLeft() != null && res.getAttemptsLeft() == 0) {
//            return ResponseEntity.status(429).body(res); // matches your PinStep's 429 handling
//        }
//        if (!res.isVerified()) {
//            return ResponseEntity.status(401).body(res);
//        }
//        return ResponseEntity.ok(res);
//    }

    /** Public — the fast daily-login path. No providerToken needed at all. */
    @PostMapping("/verify-pin")
    public ResponseEntity<VerifyPinResponseDTO> verifyPin(
            @Valid @RequestBody VerifyPinRequestDTO req) {

        VerifyPinResponseDTO res = pinService.verifyPin(req.getDeviceId(), req.getPin());

        // Expired PIN — distinct from wrong-PIN, so frontend can route to OTP reset
        if (Boolean.TRUE.equals(res.getExpired())) {
            return ResponseEntity.status(401).body(res);
        }
        if (!res.isVerified() && res.getAttemptsLeft() != null && res.getAttemptsLeft() == 0) {
            return ResponseEntity.status(429).body(res); // matches your PinStep's 429 handling
        }
        if (!res.isVerified()) {
            return ResponseEntity.status(401).body(res);
        }
        return ResponseEntity.ok(res);
    }
}
