package com.servicelink.core.controller;

import com.servicelink.core.service.UserService;
import org.springframework.web.multipart.MultipartFile;

import com.servicelink.core.dto.ResetPasswordDTO;
import com.servicelink.core.dto.request.LoginRequestDTO;
import com.servicelink.core.dto.request.OtpRequestDto;
import com.servicelink.core.dto.request.RegisterRequestDTO;
import com.servicelink.core.dto.response.AuthResponseDTO;
import com.servicelink.core.dto.response.OtpSendResponseDTO;
import com.servicelink.core.dto.response.OtpVerifyResponseDTO;
import com.servicelink.core.dto.response.UserResponseDTO;
import com.servicelink.core.mapper.UserMapper;
import com.servicelink.core.model.user.User;
import com.servicelink.core.model.user.UserProfile;
import com.servicelink.core.repository.UserRepository;
import com.servicelink.core.security.JwtService;
import com.servicelink.core.service.*;

import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.user.Role;
import com.servicelink.core.repository.appointment.ProviderRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final AuthService    authService;
    private final OtpService     otpService;
    private final EmailService   emailService;
    private final PhoneOtpService phoneOtpService;
    private final JwtService     jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserMapper userMapper;
    private final UserService userService;
    private final ProviderRepository providerRepository;

    // ─── Standard registration / login ────────────────────────────────────────

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponseDTO> refreshToken(@RequestBody Map<String, String> body) {

        String refreshToken = body.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        String email;
        String jti;
        try {
            email = jwtService.extractUsername(refreshToken);
            jti = jwtService.extractJti(refreshToken);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!"REFRESH".equals(jwtService.extractTokenType(refreshToken))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!jwtService.isTokenValid(refreshToken, email)
                || !refreshTokenService.isValid(email, jti, refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Rotate: revoke old, issue new
        refreshTokenService.revoke(email, jti);

        String newAccessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole());
        String newRefreshToken = jwtService.generateRefreshToken(user.getEmail());
        String newJti = jwtService.extractJti(newRefreshToken);

        refreshTokenService.store(email, newJti, newRefreshToken, jwtService.getRefreshTokenExpirationMillis());

        return ResponseEntity.ok(AuthResponseDTO.builder()
                .token(newAccessToken)
                .refreshToken(newRefreshToken)
                .email(email)
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(Authentication auth) {
        if (auth != null && auth.isAuthenticated()) {
            User user = (User) auth.getPrincipal();
            refreshTokenService.revokeAllForUser(user.getEmail());
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getMe(Authentication auth) {

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = (User) auth.getPrincipal();

        return ResponseEntity.ok(userMapper.toResponseDTO(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponseDTO> updateMe(
            Authentication auth,
            @RequestBody Map<String, String> body) {

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = (User) auth.getPrincipal();
        String fullName = body.get("fullName");

        if (fullName != null && !fullName.isBlank()) {
            UserProfile profile = user.getProfile();
            if (profile == null) {
                profile = new UserProfile();
                profile.setUser(user);
            }
            profile.setFullName(fullName.trim());
            user.setProfile(profile);
            userRepository.save(user);
        }

        return ResponseEntity.ok(userMapper.toResponseDTO(user));
    }

    @PostMapping("/me/photo")
    public ResponseEntity<UserResponseDTO> updateMyPhoto(
            Authentication auth,
            @RequestParam("image") MultipartFile image) {

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = (User) auth.getPrincipal();
        User updated = userService.updateProfileImage(user.getId(), image);

        return ResponseEntity.ok(userMapper.toResponseDTO(updated));
    }

    @PostMapping("/me/verify-phone-otp")
    public ResponseEntity<UserResponseDTO> verifyPhoneOtpForCurrentUser(
            Authentication auth,
            @RequestBody Map<String, String> body) {

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String phone = body.get("phone");
        String otp = body.get("otp");

        if (phone == null || otp == null) {
            throw new IllegalArgumentException("Phone and OTP are required");
        }

        boolean valid = otpService.verifyOtp(phone, otp);
        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).build();
        }

        User user = (User) auth.getPrincipal();
        UserProfile profile = user.getProfile();
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(user);
        }
        profile.setPhoneNumber(phone);
        profile.setPhoneVerified(true);
        user.setProfile(profile);

        userRepository.save(user);

        return ResponseEntity.ok(userMapper.toResponseDTO(user));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody ResetPasswordDTO dto) {
        authService.resetPassword(dto.getEmail(), dto.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }

    // ─── Phone OTP ────────────────────────────────────────────────────────────

    @PostMapping("/send-phone-otp")
    public ResponseEntity<OtpSendResponseDTO> sendPhoneOtp(
            @RequestBody Map<String, String> body) {

        String phone = body.get("phone");
        if (phone == null || phone.isBlank()) {
            throw new IllegalArgumentException("Phone number is required");
        }

        String otp = otpService.generateOtp(phone);
        PhoneOtpService.SendResult result = phoneOtpService.sendOtp(phone, otp);

        return ResponseEntity.ok(OtpSendResponseDTO.builder()
                .message(result.isAutomated()
                        ? "OTP sent — check your phone"
                        : "OTP ready — tap the WhatsApp link to view it")
                .deliveryMethod(result.method().name())
                .whatsappLink(result.whatsappLink())
                .build());
    }

    @PostMapping("/verify-phone-otp")
    public ResponseEntity<OtpVerifyResponseDTO> verifyPhoneOtp(
            @RequestBody Map<String, String> body) {

        String phone = body.get("phone");
        String otp   = body.get("otp");

        if (phone == null || otp == null) {
            throw new IllegalArgumentException("Phone and OTP are required");
        }

        boolean valid = otpService.verifyOtp(phone, otp);
        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(OtpVerifyResponseDTO.builder()
                            .verified(false)
                            .message("Invalid or expired OTP")
                            .build());
        }

        // Issue a short-lived "provider applicant" token explicitly timed for 15 minutes (900_000 ms)
        String providerToken = jwtService.generatePurposeToken(
                Map.of("type", "PHONE_VERIFIED", "role", "PROVIDER_APPLICANT"),
                phone,
                900000L
        );

        return ResponseEntity.ok(OtpVerifyResponseDTO.builder()
                .verified(true)
                .message("Phone verified successfully")
                .providerToken(providerToken)
                .build());
    }

    // ─── Email OTP ────────────────────────────────────────────────────────────

    @PostMapping("/send-email-otp")
    public ResponseEntity<OtpSendResponseDTO> sendEmailOtp(
            @RequestBody OtpRequestDto request) {

        String email = request.getEmail();
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        String otp = otpService.generateOtp(email);
        emailService.sendOtpEmail(email, otp);

        return ResponseEntity.ok(OtpSendResponseDTO.builder()
                .message("OTP sent to " + email)
                .deliveryMethod("EMAIL")
                .build());
    }

    @PostMapping("/verify-email-otp")
    public ResponseEntity<OtpVerifyResponseDTO> verifyEmailOtp(
            @RequestBody Map<String, String> body) {

        String email = body.get("email");
        String otp   = body.get("otp");

        if (email == null || otp == null) {
            throw new IllegalArgumentException("Email and OTP are required");
        }

        boolean valid = otpService.verifyOtp(email, otp);
        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(OtpVerifyResponseDTO.builder()
                            .verified(false)
                            .message("Invalid or expired OTP")
                            .build());
        }

        // Issue a short-lived "provider applicant" token explicitly timed for 15 minutes (900_000 ms)
        String providerToken = jwtService.generatePurposeToken(
                Map.of("type", "EMAIL_VERIFIED", "role", "PROVIDER_APPLICANT"),
                email,
                900000L
        );

        return ResponseEntity.ok(OtpVerifyResponseDTO.builder()
                .verified(true)
                .message("Email verified successfully")
                .providerToken(providerToken)
                .build());
    }

    // ─── Provider Login (phone or email — validates against existing accounts) ─

    /**
     * PhoneStep — validates the phone belongs to an EXISTING Provider before
     * sending a login code. Deliberately opposite of send-phone-otp (KYC flow),
     * which never checks Provider existence since the applicant isn't one yet.
     */
    @PostMapping("/provider/send-phone-otp")
    public ResponseEntity<OtpSendResponseDTO> sendProviderLoginPhoneOtp(
            @RequestBody Map<String, String> body) {

        String phone = body.get("phone");
        if (phone == null || phone.isBlank()) {
            throw new IllegalArgumentException("Phone number is required");
        }

        providerRepository.findByPhone(phone)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No registered provider found for this phone number"));

        String otp = otpService.generateOtp(phone);
        PhoneOtpService.SendResult result = phoneOtpService.sendOtp(phone, otp);

        return ResponseEntity.ok(OtpSendResponseDTO.builder()
                .message(result.isAutomated()
                        ? "Login code sent — check your phone"
                        : "Login code ready — tap the WhatsApp link to view it")
                .deliveryMethod(result.method().name())
                .whatsappLink(result.whatsappLink())
                .build());
    }

    /**
     * Verifies the phone-based login OTP, re-confirms the Provider + linked
     * User still exist and are active, then issues a real session JWT
     * (not a purpose-token like the KYC flow — this is a genuine login).
     */
    @PostMapping("/provider/verify-phone-otp")
    public ResponseEntity<AuthResponseDTO> verifyProviderLoginByPhone(
            @RequestBody Map<String, String> body) {

        String phone = body.get("phone");
        String otp = body.get("otp");
        if (phone == null || otp == null) {
            throw new IllegalArgumentException("Phone and OTP are required");
        }

        boolean valid = otpService.verifyOtp(phone, otp);
        if (!valid) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Invalid or expired login code");
        }

        Provider provider = providerRepository.findByPhone(phone)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN, "No registered provider found for this phone number"));

        User user = provider.getUser();
        if (user == null || user.getRole() != Role.PROVIDER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Linked account is not a valid provider");
        }
        if (!Boolean.TRUE.equals(provider.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This provider account is inactive");
        }

        return ResponseEntity.ok(issueSessionTokens(user));
    }

    /**
     * OtpStep (email mode) — validates the email belongs to a User with
     * role = PROVIDER before sending a login code.
     */
    @PostMapping("/provider/send-email-otp")
    public ResponseEntity<OtpSendResponseDTO> sendProviderLoginEmailOtp(
            @RequestBody Map<String, String> body) {

        String email = body.get("email");
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        userRepository.findByEmailAndRole(email, Role.PROVIDER)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No provider account found for this email"));

        String otp = otpService.generateOtp(email);
        emailService.sendOtpEmail(email, otp);

        return ResponseEntity.ok(OtpSendResponseDTO.builder()
                .message("Login code sent to " + email)
                .deliveryMethod("EMAIL")
                .build());
    }

    /**
     * Verifies the email-based login OTP. Looks up User by email + role=PROVIDER,
     * then confirms the linked Provider row exists via user_id (the FK you
     * specifically asked to use), and is active, before issuing a JWT.
     */
    @PostMapping("/provider/verify-email-otp")
    public ResponseEntity<AuthResponseDTO> verifyProviderLoginByEmail(
            @RequestBody Map<String, String> body) {

        String email = body.get("email");
        String otp = body.get("otp");
        if (email == null || otp == null) {
            throw new IllegalArgumentException("Email and OTP are required");
        }

        boolean valid = otpService.verifyOtp(email, otp);
        if (!valid) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Invalid or expired login code");
        }

        User user = userRepository.findByEmailAndRole(email, Role.PROVIDER)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN, "No provider account found for this email"));

        Provider provider = providerRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN, "Provider profile not found for this account"));

        if (!Boolean.TRUE.equals(provider.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This provider account is inactive");
        }

        return ResponseEntity.ok(issueSessionTokens(user));
    }

    /**
     * Shared token-issuing logic — same pattern as /refresh-token, so login
     * sessions behave identically to refreshed sessions (same claims, same
     * refresh-token storage/rotation mechanics).
     */
    private AuthResponseDTO issueSessionTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());
        String jti = jwtService.extractJti(refreshToken);

        refreshTokenService.store(user.getEmail(), jti, refreshToken, jwtService.getRefreshTokenExpirationMillis());

        return AuthResponseDTO.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .build();
    }
}