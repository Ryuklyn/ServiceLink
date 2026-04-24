package com.servicelink.core.controller;

import com.servicelink.core.dto.ResetPasswordDTO;
import com.servicelink.core.dto.request.LoginRequestDTO;
import com.servicelink.core.dto.request.OtpRequestDto;
import com.servicelink.core.dto.request.RegisterRequestDTO;
import com.servicelink.core.dto.response.AuthResponseDTO;
import com.servicelink.core.dto.response.UserResponseDTO;
import com.servicelink.core.model.User;
import com.servicelink.core.model.UserProfile;
import com.servicelink.core.repository.UserRepository;
import com.servicelink.core.service.AuthService;
import com.servicelink.core.service.EmailService;
import com.servicelink.core.service.OtpService;
import com.servicelink.core.service.OtpVerification;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor

//@CrossOrigin(origins = "*")
public class AuthController {

    // private final ForgetPassword forgetPassword;
    private final UserRepository userRepository;
    // private final OtpVerification otpVerification;
    private final AuthService authService;
     private final OtpService otpService;
    private final EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody OtpRequestDto request) {

        String otp = otpService.generateOtp(request.getEmail());
        System.out.println("Generated OTP: " + otp); // For testing purposes
        System.out.println("Email: " + request.getEmail());

        emailService.sendOtpEmail(request.getEmail(), otp);

        return ResponseEntity.ok("OTP sent successfully");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {

        String email = request.get("email");
        String otp = request.get("otp");

        boolean valid = otpService.verifyOtp(email, otp);

        if (valid) {
            otpService.clearOtp(email);
            return ResponseEntity.ok("OTP verified");
        }

        return ResponseEntity.status(400).body("Invalid OTP");
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getMe(Authentication auth) {

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = auth.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfile profile = user.getProfile();

        return ResponseEntity.ok(
                UserResponseDTO.builder()
                        .email(user.getEmail())
                        .fullName(profile != null ? profile.getFullName() : null)
                        .profileImage(profile != null ? profile.getProfileImage() : null)
                        .build()
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordDTO dto) {

        authService.resetPassword(dto.getEmail(), dto.getNewPassword());

        return ResponseEntity.ok("Password reset successful");
    }
}