package com.servicelink.core.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    // ─── OTP email ────────────────────────────────────────────────────────────

    @Async
    public void sendOtpEmail(String to, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to.trim());
            message.setSubject("ServiceLink — Your Verification Code");
            message.setText(
                "Hello,\n\n" +
                "Your ServiceLink verification code is:\n\n" +
                "  " + otp + "\n\n" +
                "This code is valid for 10 minutes.\n" +
                "If you did not request this, you can safely ignore this email.\n\n" +
                "— The ServiceLink Team"
            );
            mailSender.send(message);
            log.info("OTP email sent to [{}]", mask(to));
        } catch (Exception e) {
            log.error("Failed to send OTP email to [{}]: {}", mask(to), e.getMessage());
            throw e;
        }
    }

    // ─── KYC confirmation email ───────────────────────────────────────────────

    @Async
    public void sendKycConfirmationEmail(String to, String referenceNumber) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to.trim());
            message.setSubject("ServiceLink — KYC Application Received");
            message.setText(
                "Hello,\n\n" +
                "We have received your KYC application. Here are your details:\n\n" +
                "  Reference Number : " + referenceNumber + "\n" +
                "  Status           : Under Review\n\n" +
                "Our team will review your documents within 2-3 business days.\n" +
                "You will receive another email once the review is complete.\n\n" +
                "If you have any questions, contact support@servicelink.np\n\n" +
                "— The ServiceLink Team"
            );
            mailSender.send(message);
            log.info("KYC confirmation email sent to [{}] (ref: {})", mask(to), referenceNumber);
        } catch (Exception e) {
            log.error("Failed to send KYC confirmation to [{}]: {}", mask(to), e.getMessage());
            // Non-critical — do not rethrow; KYC was already saved
        }
    }

    private static String mask(String s) {
        if (s == null || s.length() <= 4) return "***";
        return s.substring(0, 4) + "***";
    }
}
