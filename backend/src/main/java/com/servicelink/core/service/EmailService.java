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
        try {
            String cleanEmail = to.trim();

            SimpleMailMessage message = new SimpleMailMessage();

            message.setTo(cleanEmail);
            message.setSubject("Your OTP Code");
            message.setText(
                "Your OTP is: " + otp + "\n\n" +
                "Valid for 5 minutes."
            );

            mailSender.send(message);
            // message.setTo("Email: " + to);
             System.out.println("EMAIL SENT: " + message);

        } catch (Exception e) {
            System.out.println("EMAIL ERROR: " + e.getMessage());
            throw e;
        }
    }
}
