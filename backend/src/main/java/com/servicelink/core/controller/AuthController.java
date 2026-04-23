package com.servicelink.core.controller;

import com.servicelink.core.dto.request.LoginRequestDTO;
import com.servicelink.core.dto.request.RegisterRequestDTO;
import com.servicelink.core.dto.response.AuthResponseDTO;
import com.servicelink.core.service.AuthService;
import com.servicelink.core.service.ForgetPassword;
import com.servicelink.core.service.OtpVerification;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
//@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private ForgetPassword forgetPassword;

    @Autowired
    private OtpVerification otpVerification;

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

        if (isValid) {
            return "OTP verified";
        } else {
            return "Invalid or expired OTP";
        }
    }
}
