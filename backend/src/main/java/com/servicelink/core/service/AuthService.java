package com.servicelink.core.service;

import com.servicelink.core.dto.auth.LoginRequestDTO;
import com.servicelink.core.dto.request.RegisterRequestDTO;
import com.servicelink.core.dto.response.AuthResponseDTO;
import com.servicelink.core.model.auth.AuthProvider;
import com.servicelink.core.model.user.Role;
import com.servicelink.core.model.user.TwoFactorMethod;
import com.servicelink.core.model.user.User;
import com.servicelink.core.model.user.UserProfile;
import com.servicelink.core.repository.UserRepository;
import com.servicelink.core.security.JwtService;
import com.servicelink.core.service.appointment.RescheduleTokenService;
import com.servicelink.core.model.business.ProUser;
import com.servicelink.core.model.business.TeamMember;
import com.servicelink.core.repository.business.ProUserRepository;
import com.servicelink.core.repository.business.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final long PRE_AUTH_2FA_EXPIRY_MILLIS = 300_000L; // 5 minutes

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final RescheduleTokenService rescheduleTokenService;
    private final TwoFactorAuthService twoFactorAuthService;
    private final OtpService otpService;       // ➕ new
    private final EmailService emailService;   // ➕ new
    private final ProUserRepository proUserRepository;
    private final TeamMemberRepository teamMemberRepository;

    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use.");
        }

        User user = new User();
        user.setEmail(request.getEmail().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setProvider(AuthProvider.LOCAL);
        user.setRole(Role.CUSTOMER);

        UserProfile profile = new UserProfile();
        profile.setFullName(request.getFullName());
        profile.setProfileImage(null);
        profile.setUser(user);
        user.setProfile(profile);

        userRepository.save(user);

        return AuthResponseDTO.builder()
                .message("Registration successful. Please log in.")
                .build();
    }

    public AuthResponseDTO login(LoginRequestDTO request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        // ── 2FA gate ────────────────────────────────────────────────────────
        // Password matched, but don't issue a real session yet — only a
        // short-lived pre-auth token. Real tokens are issued from
        // completeTwoFactorLogin() once the OTP/backup code checks out.
        if (user.is2FAEnabled()) {
            if (user.getTwoFactorMethod() == TwoFactorMethod.EMAIL) {
                // TOTP codes live in the user's app already — nothing to send.
                // EMAIL method requires actively pushing a fresh code now.
                sendLoginEmailOtp(user);
            }

            return AuthResponseDTO.builder()
                    .requiresTwoFactor(true)
                    .preAuthToken(issuePreAuthToken(user))
                    .twoFactorMethod(user.getTwoFactorMethod())
                    .email(user.getEmail())
                    .build();
        }

        activateRescheduleTokensIfCustomer(user);
        return issueFullLoginSession(user);
    }

    /**
     * POST /auth/2fa/login-resend — only meaningful for EMAIL method.
     * Re-sends a fresh code against the same pre-auth session.
     */
    public void resendLoginTwoFactorCode(String preAuthToken) {
        User user = resolvePreAuthUser(preAuthToken);

        if (user.getTwoFactorMethod() != TwoFactorMethod.EMAIL) {
            throw new IllegalStateException("Resend is only available for email-based verification");
        }

        sendLoginEmailOtp(user);
    }

    /**
     * Step 2 of the 2FA login flow — called from POST /auth/2fa/login-verify.
     * Accepts a TOTP code, an emailed code, or a one-time backup code —
     * whichever matches the user's configured method, plus backup codes
     * always work regardless of method as the recovery path.
     */
//    public AuthResponseDTO completeTwoFactorLogin(String preAuthToken, String code) {
//
//        User user = resolvePreAuthUser(preAuthToken);
//
//        boolean validPrimary = switch (user.getTwoFactorMethod()) {
//            case TOTP -> user.getTwoFactorSecret() != null
//                    && twoFactorAuthService.verifyCode(user.getTwoFactorSecret(), code);
//            case EMAIL -> otpService.verifyOtp("2fa:" + user.getEmail(), code);
//        };
//
//        boolean validBackup = !validPrimary
//                && twoFactorAuthService.matchesAnyBackupCode(code, user.getBackupCodes());
//
//        if (!validPrimary && !validBackup) {
//            throw new IllegalArgumentException("Invalid or expired verification code");
//        }
//        if (validBackup) {
//            List<String> remaining = user.getBackupCodes().stream()
//                    .filter(hash -> !BCrypt.checkpw(code, hash))
//                    .collect(Collectors.toCollection(ArrayList::new));
//            user.setBackupCodes(remaining);
//            userRepository.save(user);
//        }
//
//        activateRescheduleTokensIfCustomer(user);
//        return issueFullLoginSession(user);
    public AuthResponseDTO completeTwoFactorLogin(String preAuthToken, String code) {

        User user = resolvePreAuthUser(preAuthToken);

        boolean validPrimary = false;
        try {
            validPrimary = switch (user.getTwoFactorMethod()) {
                case TOTP -> user.getTwoFactorSecret() != null
                        && twoFactorAuthService.verifyCode(user.getTwoFactorSecret(), code);
                case EMAIL -> otpService.verifyOtp("2fa:" + user.getEmail(), code);
            };
        } catch (Exception e) {
            // Ignore error to fall back to backup code check
        }

        boolean validBackup = !validPrimary
                && twoFactorAuthService.matchesAnyBackupCode(code, user.getBackupCodes());

        if (!validPrimary && !validBackup) {
            throw new IllegalArgumentException("Invalid or expired verification code");
        }

        if (validBackup) {
            List<String> remaining = user.getBackupCodes().stream()
                    .filter(hash -> !BCrypt.checkpw(code, hash))
                    .collect(Collectors.toCollection(ArrayList::new));
            user.setBackupCodes(remaining);
            userRepository.save(user);
        }

        activateRescheduleTokensIfCustomer(user);
        return issueFullLoginSession(user);
    }

    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        refreshTokenService.revokeAllForUser(email);  // kills all sessions on password reset
    }

    // ─── Shared helpers ─────────────────────────────────────────────────────

//    private void sendLoginEmailOtp(User user) {
//        String otp = otpService.generateOtp(user.getEmail());
//        emailService.sendOtpEmail(user.getEmail(), otp);
//    }
    private void sendLoginEmailOtp(User user) {
        String otp = otpService.generateOtp("2fa:" + user.getEmail());
        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    private String issuePreAuthToken(User user) {
        return jwtService.generatePurposeToken(
                Map.of("type", "PRE_AUTH_2FA"),
                user.getEmail(),
                PRE_AUTH_2FA_EXPIRY_MILLIS
        );
    }

    private User resolvePreAuthUser(String preAuthToken) {
        if (!"PRE_AUTH_2FA".equals(jwtService.extractTokenType(preAuthToken))) {
            throw new IllegalArgumentException("Invalid or expired 2FA session");
        }

        String email = jwtService.extractUsername(preAuthToken);
        if (!jwtService.isTokenValid(preAuthToken, email)) {
            throw new IllegalArgumentException("Invalid or expired 2FA session");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!user.is2FAEnabled() || user.getTwoFactorMethod() == null) {
            throw new IllegalStateException("2FA is not enabled for this account");
        }

        return user;
    }

    private AuthResponseDTO issueFullLoginSession(User user) {
        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        String jti = jwtService.extractJti(refreshToken);
        refreshTokenService.store(
                user.getEmail(), jti, refreshToken, jwtService.getRefreshTokenExpirationMillis());

        UserProfile profile = user.getProfile();

        return AuthResponseDTO.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .fullName(resolveFullName(user))
                .profileImage(profile != null ? profile.getProfileImage() : null)
                .requiresProfileImage(profile == null || profile.getProfileImage() == null)
                .role(user.getRole().name())
                .build();
    }

    public String resolveFullName(User user) {
        if (user.getRole() == Role.PRO) {
            Optional<ProUser> proUser = proUserRepository.findByUser_Id(user.getId());
            if (proUser.isPresent() && proUser.get().getFullName() != null && !proUser.get().getFullName().isBlank()) {
                return proUser.get().getFullName();
            }
            Optional<TeamMember> teamMember = teamMemberRepository.findAll().stream()
                    .filter(tm -> tm.getUser() != null && tm.getUser().getId().equals(user.getId()))
                    .findFirst();
            if (teamMember.isPresent() && teamMember.get().getFullName() != null && !teamMember.get().getFullName().isBlank()) {
                return teamMember.get().getFullName();
            }
        }

        UserProfile profile = user.getProfile();
        if (profile != null && profile.getFullName() != null && !profile.getFullName().isBlank()) {
            return profile.getFullName();
        }

        if (user.getFullName() != null && !user.getFullName().isBlank()) {
            return user.getFullName();
        }

        return "there";
    }

    private void activateRescheduleTokensIfCustomer(User user) {
        if (user.getRole() == Role.CUSTOMER) {
            try {
                rescheduleTokenService.getOrCreateForYear(user.getId(), Year.now().getValue());
            } catch (Exception e) {
                log.error("Failed to activate reschedule tokens for user {} on login", user.getId(), e);
            }
        }
    }
}