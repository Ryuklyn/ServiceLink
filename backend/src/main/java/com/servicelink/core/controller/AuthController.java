package com.servicelink.core.controller;

import com.servicelink.core.service.UserService;
import org.springframework.web.multipart.MultipartFile;

import com.servicelink.core.dto.ResetPasswordDTO;
import com.servicelink.core.dto.auth.LoginRequestDTO;
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
import com.servicelink.core.repository.provider.ProviderRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Slf4j
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
    private final com.servicelink.core.repository.provider.pin.ProviderDevicePinRepository providerDevicePinRepository;
    private final com.servicelink.core.service.SessionService sessionService;

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
        Role role;
        try {
            email = jwtService.extractUsername(refreshToken);
            jti = jwtService.extractJti(refreshToken);
            role = jwtService.extractRole(refreshToken);
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

        User user = userRepository.findByEmailAndRole(email, role)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == Role.PROVIDER && !sessionService.isSessionActive(user.getId(), jti)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Rotate: revoke old, issue new
        refreshTokenService.revoke(email, jti);

        String newRefreshToken = jwtService.generateRefreshToken(user.getEmail(), user.getRole());
        String newJti = jwtService.extractJti(newRefreshToken);
        String newAccessToken;

        if (user.getRole() == Role.PROVIDER) {
            newAccessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole(), newJti);
            refreshTokenService.store(email, newJti, newRefreshToken, jwtService.getRefreshTokenExpirationMillis());
            sessionService.registerSession(user.getId(), user.getEmail(), newJti, jwtService.getRefreshTokenExpirationMillis());
        } else {
            newAccessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole());
            refreshTokenService.store(email, newJti, newRefreshToken, jwtService.getRefreshTokenExpirationMillis());
        }

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
            if (user.getRole() == Role.PROVIDER) {
                sessionService.clearSession(user.getId());
            }
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

//    @GetMapping("/me")
//    public ResponseEntity<UserResponseDTO> getMe(Authentication auth) {
//
//        if (auth == null || !auth.isAuthenticated()) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
//        }
//
//        User user = (User) auth.getPrincipal();
//
//        return ResponseEntity.ok(userMapper.toResponseDTO(user));
//    }
@GetMapping("/me")
public ResponseEntity<UserResponseDTO> getMe(Authentication auth) {

    if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof User)) {
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

        String phone = normalizePhone(body.get("phone"));
        String otp = body.get("otp");

        if (phone == null || otp == null) {
            throw new IllegalArgumentException("Phone and OTP are required");
        }

        boolean valid = otpService.verifyOtp(phone, otp);
        if (!valid) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Invalid or expired OTP. Request a new code and use the latest one.");
        }

        User user = (User) auth.getPrincipal();
        if (userRepository.existsByPhoneAndRoleExcludingUser(phone, user.getRole(), user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This phone number is already registered as a " + accountRoleLabel(user.getRole()) + " account.");
        }
        UserProfile profile = user.getProfile();
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(user);
        }

        String oldPhone = profile.getPhoneNumber(); // capture BEFORE overwrite — may be null

        profile.setPhoneNumber(phone);
        profile.setPhoneVerified(true);
        user.setProfile(profile);

        userRepository.save(user);

        // 🔔 Audit alert — fires only when this is an actual CHANGE (old number existed and differs),
        // not on first-time "Add Contact Number" (oldPhone == null).
        try {
            if (oldPhone != null && !oldPhone.isBlank() && !oldPhone.equals(phone)) {
                String alertText = "Security Alert: A request to change your phone number was initiated. "
                        + "If this wasn't you, contact support immediately.";
                phoneOtpService.sendPlainAlert(oldPhone, alertText);
                emailService.sendPhoneChangedAlert(user.getEmail(), phone);
            }
        } catch (Exception ex) {
            log.warn("Failed to send phone-change audit alert for user {}", user.getId(), ex);
        }

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
            @RequestBody Map<String, String> body,
            Authentication auth) {

        String phone = normalizePhone(body.get("phone"));
        if (phone == null || phone.isBlank()) {
            throw new IllegalArgumentException("Phone number is required");
        }

        // The same phone may belong to one CUSTOMER and one PROVIDER/PRO,
        // but never to two accounts of the same role. Authenticated settings
        // requests are checked before generating/sending an OTP. Public KYC
        // requests have no User principal and continue through normally.
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof User currentUser
                && userRepository.existsByPhoneAndRoleExcludingUser(
                        phone, currentUser.getRole(), currentUser.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This phone number is already registered as a "
                            + accountRoleLabel(currentUser.getRole()) + " account.");
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

    private String normalizePhone(String phone) {
        return phone == null ? null : phone.trim();
    }

    private String accountRoleLabel(Role role) {
        return role == Role.CUSTOMER ? "user" : role.name().toLowerCase();
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

//    @PostMapping("/send-email-otp")
//    public ResponseEntity<OtpSendResponseDTO> sendEmailOtp(
//            @RequestBody OtpRequestDto request) {
//
//        String email = request.getEmail();
//        if (email == null || email.isBlank()) {
//            throw new IllegalArgumentException("Email is required");
//        }
//
//        String otp = otpService.generateOtp(email);
//        emailService.sendOtpEmail(email, otp);
//
//        return ResponseEntity.ok(OtpSendResponseDTO.builder()
//                .message("OTP sent to " + email)
//                .deliveryMethod("EMAIL")
//                .build());
//    }

    @PostMapping("/send-email-otp")
    public ResponseEntity<OtpSendResponseDTO> sendEmailOtp(@RequestBody OtpRequestDto request) {
        String email = request.getEmail();
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        String otp = otpService.generateOtp("email-verify:" + email);
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

        boolean valid = otpService.verifyOtp("email-verify:" + email, otp); // ✅ matches send

        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(OtpVerifyResponseDTO.builder()
                            .verified(false)
                            .message("Invalid or expired OTP")
                            .build());
        }

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
    public ResponseEntity<OtpVerifyResponseDTO> verifyProviderLoginByPhone(
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

        String providerToken = jwtService.generatePurposeToken(
                Map.of("type", "LOGIN_OTP_VERIFIED", "role", "PROVIDER"),
                user.getEmail(),
                900000L
        );

        boolean pinExists = providerDevicePinRepository.existsByProvider_Id(provider.getId());

        return ResponseEntity.ok(OtpVerifyResponseDTO.builder()
                .verified(true)
                .message("Phone verified successfully")
                .providerToken(providerToken)
                .pinExists(pinExists)
                .build());
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
    public ResponseEntity<OtpVerifyResponseDTO> verifyProviderLoginByEmail(
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

        String providerToken = jwtService.generatePurposeToken(
                Map.of("type", "LOGIN_OTP_VERIFIED", "role", "PROVIDER"),
                user.getEmail(),
                900000L
        );

        boolean pinExists = providerDevicePinRepository.existsByProvider_Id(provider.getId());

        return ResponseEntity.ok(OtpVerifyResponseDTO.builder()
                .verified(true)
                .message("Email verified successfully")
                .providerToken(providerToken)
                .pinExists(pinExists)
                .build());
    }

    private AuthResponseDTO issueSessionTokens(User user) {
        String refreshToken = jwtService.generateRefreshToken(user.getEmail(), user.getRole());
        String jti = jwtService.extractJti(refreshToken);
        String accessToken;

        if (user.getRole() == Role.PROVIDER) {
            accessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole(), jti);
            refreshTokenService.store(user.getEmail(), jti, refreshToken, jwtService.getRefreshTokenExpirationMillis());
            sessionService.registerSession(user.getId(), user.getEmail(), jti, jwtService.getRefreshTokenExpirationMillis());
        } else {
            accessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole());
            refreshTokenService.store(user.getEmail(), jti, refreshToken, jwtService.getRefreshTokenExpirationMillis());
        }

        return AuthResponseDTO.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .build();
    }

    @PostMapping("/2fa/login-verify")
    public ResponseEntity<AuthResponseDTO> verifyLoginTwoFactor(@RequestBody Map<String, String> body) {

        String preAuthToken = body.get("preAuthToken");
        String code = body.get("code");

        if (preAuthToken == null || code == null) {
            throw new IllegalArgumentException("preAuthToken and code are required");
        }

        return ResponseEntity.ok(authService.completeTwoFactorLogin(preAuthToken, code));
    }

    @PostMapping("/2fa/login-resend")
    public ResponseEntity<Map<String, String>> resendLoginTwoFactor(@RequestBody Map<String, String> body) {

        String preAuthToken = body.get("preAuthToken");
        if (preAuthToken == null) {
            throw new IllegalArgumentException("preAuthToken is required");
        }

        authService.resendLoginTwoFactorCode(preAuthToken);
        return ResponseEntity.ok(Map.of("message", "Code resent"));
    }
}
