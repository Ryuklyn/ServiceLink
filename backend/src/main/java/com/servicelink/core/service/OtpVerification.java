package com.servicelink.core.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpSession;

@Service
public class OtpVerification {
    public boolean verifyOtp(String inputOtp, HttpSession session) {
        String sessionOtp = (String) session.getAttribute("otp");
        LocalDateTime expiryTime = (LocalDateTime) session.getAttribute("expiryTime");

      // ❌ no OTP in session
        if (sessionOtp == null || expiryTime == null) {
            return false;
        }

        // ❌ expired
        if (LocalDateTime.now().isAfter(expiryTime)) {
            session.invalidate(); // cleanup
            return false;
        }

        // ✅ match check
        if (sessionOtp.equals(inputOtp)) {
            session.removeAttribute("otp"); // optional cleanup
            return true;
        }

        return false;
    }
}
