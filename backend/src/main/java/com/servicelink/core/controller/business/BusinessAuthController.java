package com.servicelink.core.controller.business;

import com.servicelink.core.dto.ResetPasswordDTO;
import com.servicelink.core.dto.request.OtpRequestDto;
import com.servicelink.core.dto.response.OtpSendResponseDTO;
import com.servicelink.core.dto.response.OtpVerifyResponseDTO;
import com.servicelink.core.dto.response.AuthResponseDTO;
import com.servicelink.core.security.JwtService;
import com.servicelink.core.service.RefreshTokenService;
import com.servicelink.core.model.user.Role;
import com.servicelink.core.model.user.User;
import com.servicelink.core.repository.UserRepository;
import com.servicelink.core.service.AuthService;
import com.servicelink.core.service.EmailService;
import com.servicelink.core.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth/business")
public class BusinessAuthController {

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final EmailService emailService;
    private final AuthService authService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    /**
     * ForgotPasswordStep 1 — validates the email belongs to an EXISTING
     * business (role = PRO) account before sending a code. Deliberately the
     * same guard pattern as /provider/send-email-otp, scoped to PRO instead
     * of PROVIDER, and deliberately NOT reusing the generic /send-email-otp
     * (KYC) endpoint since that one never checks account existence.
     */
    @PostMapping("/send-email-otp")
    public ResponseEntity<OtpSendResponseDTO> sendBusinessForgotPasswordOtp(
            @RequestBody OtpRequestDto request) {

        String email = request.getEmail();
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        userRepository.findByEmailAndRole(email, Role.PRO)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No business account found for this email"));

        String otp = otpService.generateOtp(email);
        emailService.sendOtpEmail(email, otp);

        return ResponseEntity.ok(OtpSendResponseDTO.builder()
                .message("OTP sent to " + email)
                .deliveryMethod("EMAIL")
                .build());
    }

    /**
     * ForgotPasswordStep 2 — verifies the OTP. Unlike /provider/verify-email-otp,
     * this does NOT issue a session token (this isn't a login), it just confirms
     * the code so the frontend can move on to the reset-password screen.
     */
    @PostMapping("/verify-email-otp")
    public ResponseEntity<OtpVerifyResponseDTO> verifyBusinessForgotPasswordOtp(
            @RequestBody Map<String, String> body) {

        String email = body.get("email");
        String otp = body.get("otp");

        if (email == null || otp == null) {
            throw new IllegalArgumentException("Email and OTP are required");
        }

        userRepository.findByEmailAndRole(email, Role.PRO)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No business account found for this email"));

        boolean valid = otpService.verifyOtp(email, otp);
        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(OtpVerifyResponseDTO.builder()
                            .verified(false)
                            .message("Invalid or expired OTP")
                            .build());
        }

        return ResponseEntity.ok(OtpVerifyResponseDTO.builder()
                .verified(true)
                .message("Email verified successfully")
                .build());
    }

    @PostMapping("/login/verify-email-otp")
    public ResponseEntity<AuthResponseDTO> verifyBusinessLoginOtp(
            @RequestBody Map<String, String> body) {

        String email = body.get("email");
        String otp = body.get("otp");

        if (email == null || otp == null) {
            throw new IllegalArgumentException("Email and OTP are required");
        }

        boolean valid = otpService.verifyOtp(email, otp);
        if (!valid) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Invalid or expired OTP");
        }

        User user = userRepository.findByEmailAndRole(email, Role.PRO)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN, "This account is not registered as a business account"));

        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());
        String jti = jwtService.extractJti(refreshToken);

        refreshTokenService.store(user.getEmail(), jti, refreshToken, jwtService.getRefreshTokenExpirationMillis());

        return ResponseEntity.ok(AuthResponseDTO.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .build());
    }

    /**
     * ForgotPasswordStep 3 — resets the password, re-confirming role = PRO
     * right before the write so a stale/forged request can't reset a
     * non-business account's password through this route.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetBusinessPassword(
            @RequestBody ResetPasswordDTO dto) {

        User user = userRepository.findByEmailAndRole(dto.getEmail(), Role.PRO)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No business account found for this email"));

        authService.resetPassword(user.getEmail(), dto.getNewPassword());

        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }
}
