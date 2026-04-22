package com.servicelink.core.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpSession;

@Service
public class ForgetPassword {
    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    public void sendOtp(String email, HttpSession session) {
        String otp = otpService.generateOtp();
        System.out.println(otp);

        LocalDateTime expireTime = LocalDateTime.now().plusMinutes(5);
        
        session.setAttribute("otp", otp);
        session.setAttribute("email", email);
        session.setAttribute("expireTime", expireTime);

        emailService.sendOtpEmail(email, otp);
    }

}