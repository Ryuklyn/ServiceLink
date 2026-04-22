package com.servicelink.core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("[EMAIL_ADDRESS]");
        message.setTo(to);
        message.setSubject("Password Reset OTP - servicelink");
        message.setText("Please find below the one time password (OTP) to reset the password for your ServiceLink account.\nOTP: " + otp + "\n\n Your OTP will be valid for only 5 minutes. \n\nPlease do not share this OTP with anyone.");
        mailSender.send(message);
    }
}
