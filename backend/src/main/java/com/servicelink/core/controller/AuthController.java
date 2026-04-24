package com.servicelink.core.controller;

import com.servicelink.core.dto.request.LoginRequestDTO;
import com.servicelink.core.dto.request.RegisterRequestDTO;
import com.servicelink.core.dto.response.AuthResponseDTO;
import com.servicelink.core.dto.response.UserResponseDTO;
import com.servicelink.core.model.User;
import com.servicelink.core.model.UserProfile;
import com.servicelink.core.repository.UserRepository;
import com.servicelink.core.service.AuthService;
import com.servicelink.core.service.ForgetPassword;
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

    private final ForgetPassword forgetPassword;
    private final UserRepository userRepository;
    private final OtpVerification otpVerification;
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    public String sendOtp(@RequestParam String email, HttpSession session) {
        forgetPassword.sendOtp(email, session);
        return "OTP sent";
    }

    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestParam String otp, HttpSession session) {
        boolean isValid = otpVerification.verifyOtp(otp, session);
        return isValid ? "OTP verified" : "Invalid or expired OTP";
    }

    // @GetMapping("/me")
    // public ResponseEntity<?> getCurrentUser(Authentication auth) {
    //     if (auth == null || !auth.isAuthenticated()) {
    //         return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
    //                 .body(Map.of("error", "User not authenticated"));
    //     }

    //     String email = auth.getName();
    //     User user = userRepository.findByEmail(email)
    //             .orElse(null);

    //     if (user == null) {
    //         return ResponseEntity.status(HttpStatus.NOT_FOUND)
    //                 .body(Map.of("error", "User not found"));
    //     }

    //     UserProfile profile = user.getProfile();
    //     return ResponseEntity.ok(Map.of(
    //             "name", profile != null ? profile.getFullName() : null,
    //             "email", user.getEmail(),
    //             "picture", profile != null ? profile.getProfileImage() : null
    //     ));
    // }

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
    // @GetMapping("/me")
    // public ResponseEntity<?> getMe(@RequestHeader("Authorization") String authHeader) {
    //     System.out.println("HEADER: " + authHeader);
    //     // System.out.println("AUTH OBJECT: " + auth);
    //     return ResponseEntity.ok("Working");
    // }
}
