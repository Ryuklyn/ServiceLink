package com.servicelink.core.service;

import com.servicelink.core.dto.request.ChangePasswordRequestDTO;
import com.servicelink.core.dto.request.DeleteAccountRequestDTO;
import com.servicelink.core.dto.request.UserRequestDTO;
import com.servicelink.core.dto.response.TwoFactorSetupInitResponseDTO;
import com.servicelink.core.dto.response.TwoFactorSetupVerifyResponseDTO;
import com.servicelink.core.model.user.TwoFactorMethod;
import com.servicelink.core.model.user.User;
import com.servicelink.core.model.user.UserProfile;
import com.servicelink.core.repository.UserRepository;
import com.servicelink.core.storage.SupabaseStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository repo;
    private final SupabaseStorageService supabaseStorageService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final OtpService otpService;
    private final RefreshTokenService refreshTokenService;
    private final TwoFactorAuthService twoFactorAuthService;

    public UserService(
            UserRepository repo,
            SupabaseStorageService supabaseStorageService,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            OtpService otpService, // ✅ was already used below but missing from ctor — see note
            RefreshTokenService refreshTokenService,
            TwoFactorAuthService twoFactorAuthService
    ) {
        this.repo = repo;
        this.supabaseStorageService = supabaseStorageService;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.otpService = otpService;
        this.refreshTokenService = refreshTokenService;
        this.twoFactorAuthService = twoFactorAuthService;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Basic CRUD
    // ─────────────────────────────────────────────────────────────────────────

    public List<User> getAllUsers() {
        return repo.findAll();
    }

    public User getUserById(Long id) {
        return findUserOrThrow(id);
    }

    public User save(User user) {
        return repo.save(user);
    }

    // ✅ Self-service account deletion — password + typed confirmation required
    public void deleteOwnAccount(User user, DeleteAccountRequestDTO dto) {

        if (!"DELETE".equals(dto.getConfirmationText())) {
            throw new IllegalArgumentException("Type DELETE to confirm account deletion");
        }

        if (user.getPassword() != null) {
            if (dto.getCurrentPassword() == null
                    || !passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
                throw new IllegalArgumentException("Current password is incorrect");
            }
        }
        // OAuth (Google) users: no password to check — typed "DELETE" confirmation is sufficient.

        String email = user.getEmail();

        refreshTokenService.revokeAllForUser(email);

        sendAlertSafely(() -> emailService.sendAccountDeletedAlert(email),
                "account-deleted alert", user.getId());

        repo.deleteById(user.getId());
    }

    public User updateProfile(Long id, UserRequestDTO dto) {
        User existing = findUserOrThrow(id);

        if (dto.getEmail() != null) {
            existing.setEmail(dto.getEmail());
        }

        UserProfile profile = getOrCreateProfile(existing);
        if (dto.getFullName() != null) {
            profile.setFullName(dto.getFullName());
        }
        existing.setProfile(profile);

        return repo.save(existing);
    }

    public User updateProfileImage(Long id, MultipartFile image) {
        User user = findUserOrThrow(id);

        try {
            String imageUrl = supabaseStorageService.uploadFile(image, "profiles");

            UserProfile profile = getOrCreateProfile(user);
            profile.setProfileImage(imageUrl);
            user.setProfile(profile);

            return repo.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload profile image: " + e.getMessage(), e);
        }
    }

    public User markOnboardingSeen(Long id) {
        User user = findUserOrThrow(id);

        UserProfile profile = getOrCreateProfile(user);
        profile.setHasSeenOnboarding(true);
        user.setProfile(profile);

        return repo.save(user);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Password Management
    // ─────────────────────────────────────────────────────────────────────────

    /** Change password (logged-in user, old-password flow) */
    public User changePassword(Long id, ChangePasswordRequestDTO dto) {
        User user = findUserOrThrow(id);

        requirePassword(user);
        verifyCurrentPassword(user, dto.getCurrentPassword());

        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirmation do not match");
        }
        if (passwordEncoder.matches(dto.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password must be different from the current password");
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        User saved = repo.save(user);

        sendAlertSafely(() -> emailService.sendPasswordChangedAlert(user.getEmail()),
                "password-changed alert", user.getId());

        // ✅ implemented — when checked, kill every session (including this one).
        // Frontend handles logging the current device out after seeing this succeed.
        if (dto.isLogoutOtherDevices()) {
            refreshTokenService.revokeAllForUser(user.getEmail());
        }

        return saved;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Two-Factor Authentication
    // ─────────────────────────────────────────────────────────────────────────

    /** Step 1: verify password, then either generate a TOTP secret+QR or email a code — 2FA not enabled yet either way */
    public TwoFactorSetupInitResponseDTO init2FASetup(Long userId, String currentPassword, TwoFactorMethod method) {
        User user = findUserOrThrow(userId);

        requirePassword(user);
        verifyCurrentPassword(user, currentPassword);

        if (method == TwoFactorMethod.TOTP) {
            String secret = twoFactorAuthService.generateSecret();
            user.setTwoFactorSecret(secret);
            user.setTwoFactorMethod(TwoFactorMethod.TOTP);
            repo.save(user);

            String qr = twoFactorAuthService.generateQrCodeBase64(secret, user.getEmail());
            return TwoFactorSetupInitResponseDTO.builder()
                    .qrCodeImageBase64(qr)
                    .manualSetupKey(secret)
                    .build();
        }

        // EMAIL method — reuse the existing OtpService, same as phone/email login OTPs elsewhere
        user.setTwoFactorMethod(TwoFactorMethod.EMAIL);
        repo.save(user);
//
//        String otp = otpService.generateOtp(user.getEmail());
//        emailService.sendOtpEmail(user.getEmail(), otp);

        // init2FASetup — EMAIL branch
        String otp = otpService.generateOtp("2fa:" + user.getEmail());
        emailService.sendOtpEmail(user.getEmail(), otp);

        return TwoFactorSetupInitResponseDTO.builder().build(); // no QR/key for email method
    }

    /** Step 2: mandatory code validation before turning 2FA on — checks against whichever method was chosen in init */
//    public TwoFactorSetupVerifyResponseDTO verify2FASetup(Long userId, String otp) {
//        User user = findUserOrThrow(userId);
//
//        if (user.getTwoFactorMethod() == null) {
//            throw new IllegalStateException("2FA setup was not initiated");
//        }
//
//        boolean valid = switch (user.getTwoFactorMethod()) {
//            case TOTP -> user.getTwoFactorSecret() != null
//                    && twoFactorAuthService.verifyCode(user.getTwoFactorSecret(), otp);
////            case EMAIL -> otpService.verifyOtp(user.getEmail(), otp);
//            // verify2FASetup
//            case EMAIL -> otpService.verifyOtp("2fa:" + user.getEmail(), otp);
//        };
//
//        if (!valid) {
//            throw new IllegalArgumentException("Invalid or expired verification code");
//        }
//
//        List<String> plaintextCodes = twoFactorAuthService.generatePlaintextBackupCodes(10);
//        user.set2FAEnabled(true);
//        user.setBackupCodes(twoFactorAuthService.hashBackupCodes(plaintextCodes));
//        repo.save(user);
//
//        return TwoFactorSetupVerifyResponseDTO.builder()
//                .backupCodes(plaintextCodes) // shown once — frontend must force download/copy
//                .build();
//    }

    public TwoFactorSetupVerifyResponseDTO verify2FASetup(Long userId, String otp) {
        User user = findUserOrThrow(userId);

        if (user.getTwoFactorMethod() == null) {
            throw new IllegalStateException("2FA setup was not initiated");
        }

        boolean valid = switch (user.getTwoFactorMethod()) {
            case TOTP -> user.getTwoFactorSecret() != null
                    && twoFactorAuthService.verifyCode(user.getTwoFactorSecret(), otp);
            case EMAIL -> otpService.verifyOtp("2fa:" + user.getEmail(), otp);
        };

        if (!valid) {
            throw new IllegalArgumentException("Invalid or expired verification code");
        }

        List<String> plaintextCodes = twoFactorAuthService.generatePlaintextBackupCodes(10);
        user.set2FAEnabled(true);
        user.setBackupCodes(twoFactorAuthService.hashBackupCodes(plaintextCodes));
        repo.save(user);

        sendAlertSafely(() -> emailService.send2FAEnabledAlert(user.getEmail()),
                "2FA-enabled alert", user.getId());

        return TwoFactorSetupVerifyResponseDTO.builder()
                .backupCodes(plaintextCodes)
                .build();
    }

    public List<String> regenerateBackupCodes(Long userId) {
        User user = findUserOrThrow(userId);
        if (!user.is2FAEnabled()) {
            throw new IllegalStateException("2FA is not enabled for this account");
        }
        List<String> plaintextCodes = twoFactorAuthService.generatePlaintextBackupCodes(10);
        user.setBackupCodes(twoFactorAuthService.hashBackupCodes(plaintextCodes));
        repo.save(user);
        return plaintextCodes;
    }

    public void disable2FA(Long userId, String currentPassword) {
        disable2FA(userId, currentPassword, null);
    }

    public void disable2FA(Long userId, String currentPassword, String code) {
        User user = findUserOrThrow(userId);

        requirePassword(user);
        verifyCurrentPassword(user, currentPassword);

        if (user.getTwoFactorSecret() != null && code != null && !code.isBlank()) {
            boolean valid = twoFactorAuthService.verifyCode(user.getTwoFactorSecret(), code);
            if (!valid) {
                throw new IllegalArgumentException("Invalid verification code");
            }
        }

        user.set2FAEnabled(false);
        user.setTwoFactorMethod(null);
        user.setTwoFactorSecret(null);
        repo.save(user);

        sendAlertSafely(() -> emailService.send2FADisabledAlert(user.getEmail()),
                "2FA-disabled alert", user.getId());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Shared helpers
    // ─────────────────────────────────────────────────────────────────────────

    private User findUserOrThrow(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
    }

    private UserProfile getOrCreateProfile(User user) {
        UserProfile profile = user.getProfile();
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(user);
        }
        return profile;
    }

    private void requirePassword(User user) {
        if (user.getPassword() == null) {
            throw new IllegalStateException("This account signs in with Google and has no password to change.");
        }
    }

    private void verifyCurrentPassword(User user, String currentPassword) {
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
    }

    /** Runs a fire-and-forget notification email — never lets a failed alert fail the main request. */
    private void sendAlertSafely(Runnable action, String label, Long userId) {
        try {
            action.run();
        } catch (Exception ex) {
            log.warn("Failed to send {} for user {}", label, userId, ex);
        }
    }
}