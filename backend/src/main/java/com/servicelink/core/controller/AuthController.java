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
}