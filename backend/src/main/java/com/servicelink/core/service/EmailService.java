package com.servicelink.core.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    private static final String NAVY   = "#1e3a8a";
    private static final String ORANGE = "#e8683f";
    private static final String FROM_NAME = "ServiceLink";

    // ─── OTP email ────────────────────────────────────────────────────────────

    @Async
    public void sendOtpEmail(String to, String otp) {
        String subject = "Your ServiceLink verification code";

        String body = wrapTemplate(
                "Verify Your Email",
                "Verification Code",
                "Use the code below to complete your verification. It expires in 10 minutes.",
                """
                <div style="text-align:center; margin: 24px 0;">
                  <div style="display:inline-block; background:#fafaf9; border:1px solid #e7e5e4;
                              border-radius:10px; padding:16px 32px;">
                    <span style="font-size:28px; font-weight:700; letter-spacing:6px; color:%s;">%s</span>
                  </div>
                </div>
                <p style="font-size:13px; color:#78716c; text-align:center; margin:0;">
                  If you didn't request this code, you can safely ignore this email.
                </p>
                """.formatted(NAVY, otp),
                null, null
        );

        send(to, subject, body, "OTP");
    }

    // ─── Team invite email ───────────────────────────────────────────────────

    @Async
    public void sendTeamInviteEmail(String to, String fullName, String orgName, String inviteLink) {
        String subject = "You've been invited to join " + orgName + " on ServiceLink";
        String displayName = (fullName == null || fullName.isBlank()) ? "there" : fullName;

        String body = wrapTemplate(
                "Team Invitation",
                "You're invited, " + displayName + ".",
                orgName + " has invited you to join their workspace on ServiceLink.",
                """
                <p style="font-size:14px; line-height:1.6; color:#44403c; margin:0 0 8px;">
                  Click the button below to set your password and get started. This invitation
                  link will expire in 7 days.
                </p>
                <p style="font-size:13px; color:#78716c; margin:16px 0 0;">
                  If you weren't expecting this invitation, you can safely ignore this email.
                </p>
                """,
                "Set Your Password", inviteLink
        );

        send(to, subject, body, "Team invite (org: " + orgName + ")");
    }

    // ─── KYC confirmation email (submitted, under review) ──────────────────────

    @Async
    public void sendKycConfirmationEmail(String to, String referenceNumber) {
        String subject = "We've received your KYC application";

        String body = wrapTemplate(
                "Application Received",
                "Thanks for applying, we're on it.",
                "Your KYC application has been submitted and is now under review. "
                        + "This usually takes 2–3 business days.",
                """
                <div style="background:#fafaf9; border:1px solid #e7e5e4; border-radius:10px; padding:16px; margin: 20px 0;">
                  <p style="font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:#78716c; margin:0 0 4px;">
                    Reference Number
                  </p>
                  <p style="font-size:16px; font-weight:600; color:#1c1917; margin:0;">%s</p>
                </div>
                <p style="font-size:14px; line-height:1.6; color:#44403c; margin:0;">
                  You'll receive another email as soon as our team finishes reviewing your documents.
                  No action is needed from you right now.
                </p>
                """.formatted(referenceNumber),
                null, null
        );

        send(to, subject, body, "KYC confirmation (ref: " + referenceNumber + ")");
    }

    // ─── KYC approval email (trial starts) ──────────────────────────────────────

    @Async
    public void sendKycApprovalEmail(String to, String applicantName, String referenceNumber) {
        Instant trialEnd = Instant.now().plus(30, ChronoUnit.DAYS);
        String trialEndFormatted = DateTimeFormatter
                .ofPattern("MMMM d, yyyy")
                .withZone(ZoneId.of("Asia/Kathmandu"))
                .format(trialEnd);

        String subject = "You're verified! Your 30-day free trial has started";
        String displayName = (applicantName == null || applicantName.isBlank()) ? "there" : applicantName;

        String body = wrapTemplate(
                "Verification Approved",
                "Welcome aboard, " + displayName + ".",
                "Your profile has been verified and your free trial is now active.",
                """
                <div style="background:#fafaf9; border:1px solid #e7e5e4; border-radius:10px; padding:16px; margin: 20px 0;">
                  <p style="font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:#78716c; margin:0 0 4px;">
                    Reference Number
                  </p>
                  <p style="font-size:16px; font-weight:600; color:#1c1917; margin:0;">%s</p>
                </div>
                <p style="font-size:14px; line-height:1.6; color:#44403c;">
                  Your 30-day free trial gives you full access to the platform — no payment required
                  until it ends on <strong style="color:%s;">%s</strong>.
                </p>
                <p style="font-size:14px; line-height:1.6; color:#44403c;">
                  Before your trial ends, you'll be able to choose from our Monthly, Quarterly, or
                  Yearly plans directly from your dashboard. We'll remind you a few days in advance —
                  nothing happens automatically without your confirmation.
                </p>
                """.formatted(referenceNumber, NAVY, trialEndFormatted),
                "Go to Dashboard", "https://servicelink.com.np/dashboard"
        );

        send(to, subject, body, "KYC approval (ref: " + referenceNumber + ")");
    }

    // ─── Shared HTML template ────────────────────────────────────────────────

    /**
     * Wraps content in the ServiceLink brand shell (navy header, white body).
     *
     * @param eyebrow    small uppercase label above the heading (e.g. "Verify Your Email")
     * @param heading    main heading text
     * @param subtext    one-line description under the heading
     * @param bodyHtml   pre-built HTML for the body section (card, code, paragraphs, etc.)
     * @param ctaLabel   optional button label — pass null to omit the button
     * @param ctaUrl     optional button URL — pass null to omit the button
     */
    private String wrapTemplate(
            String eyebrow,
            String heading,
            String subtext,
            String bodyHtml,
            String ctaLabel,
            String ctaUrl
    ) {
        String ctaBlock = "";
        if (ctaLabel != null && ctaUrl != null) {
            ctaBlock = """
                <a href="%s" style="display:inline-block; margin-top:20px; padding:12px 24px;
                          background:%s; color:#fff; text-decoration:none; border-radius:8px;
                          font-weight:600; font-size:14px;">
                  %s →
                </a>
                """.formatted(ctaUrl, ORANGE, ctaLabel);
        }

        return """
            <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width:560px;
                        margin:0 auto; color:#1c1917;">
              <div style="background:%s; color:#fff; padding:32px 28px; border-radius:12px 12px 0 0;">
                <p style="color:%s; font-size:11px; letter-spacing:1.5px; text-transform:uppercase;
                          margin:0 0 12px; font-weight:700;">
                  %s
                </p>
                <h1 style="font-size:22px; margin:0 0 8px; font-weight:700;">%s</h1>
                <p style="color:#c7d2fe; font-size:14px; margin:0;">%s</p>
              </div>
              <div style="padding:28px; background:#fff; border:1px solid #e7e5e4; border-top:none;
                          border-radius:0 0 12px 12px;">
                %s
                %s
                <p style="font-size:12px; color:#a8a29e; margin-top:24px; padding-top:16px;
                          border-top:1px solid #f5f5f4;">
                  Questions? Contact us at
                  <a href="mailto:support@servicelink.np" style="color:%s;">support@servicelink.np</a>
                </p>
              </div>
            </div>
            """.formatted(NAVY, ORANGE, eyebrow, heading, subtext, bodyHtml, ctaBlock, ORANGE);
    }

    // ─── Low-level send ──────────────────────────────────────────────────────

    private void send(String to, String subject, String htmlBody, String logLabel) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");

            helper.setTo(to.trim());
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML
            helper.setFrom("no-reply@servicelink.np", FROM_NAME);

            mailSender.send(mimeMessage);
            log.info("{} email sent to [{}]", logLabel, mask(to));
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Failed to send {} email to [{}]: {}", logLabel, mask(to), e.getMessage());
        }
    }

    private static String mask(String s) {
        if (s == null || s.length() <= 4) return "***";
        return s.substring(0, 4) + "***";
    }

    @Async
    public void sendKycVideoAuditEmail(String to, String applicantName, String meetLink, Instant when) {
        String subject = "ServiceLink KYC — Video Verification Scheduled";
        String displayName = (applicantName == null || applicantName.isBlank()) ? "there" : applicantName;
        String whenFormatted = DateTimeFormatter
                .ofPattern("dd MMM yyyy, hh:mm a")
                .withZone(ZoneId.of("Asia/Kathmandu"))
                .format(when);

        String body = wrapTemplate(
                "Video Verification",
                "One more step, " + displayName + ".",
                "Your KYC video verification has been scheduled. Please join a few minutes early with your original citizenship/PAN documents ready.",
                """
                <div style="background:#fafaf9; border:1px solid #e7e5e4; border-radius:10px; padding:16px; margin: 20px 0;">
                  <p style="font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:#78716c; margin:0 0 4px;">
                    Scheduled For
                  </p>
                  <p style="font-size:16px; font-weight:600; color:#1c1917; margin:0;">%s</p>
                </div>
                """.formatted(whenFormatted),
                "Join Google Meet", meetLink
        );

        send(to, subject, body, "KYC video audit invite");
    }

    @Async
    public void sendKycRejectionEmail(String to, String applicantName, String referenceNumber, String reason) {
        String subject = "Update on your KYC application";
        String displayName = (applicantName == null || applicantName.isBlank()) ? "there" : applicantName;

        String body = wrapTemplate(
                "Verification Update",
                "We need a bit more from you, " + displayName + ".",
                "Your KYC application couldn't be approved as submitted.",
                """
                <div style="background:#fafaf9; border:1px solid #e7e5e4; border-radius:10px; padding:16px; margin: 20px 0;">
                  <p style="font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:#78716c; margin:0 0 4px;">
                    Reference Number
                  </p>
                  <p style="font-size:16px; font-weight:600; color:#1c1917; margin:0 0 12px;">%s</p>
                  <p style="font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:#78716c; margin:0 0 4px;">
                    Reason
                  </p>
                  <p style="font-size:14px; color:#44403c; margin:0;">%s</p>
                </div>
                <p style="font-size:14px; line-height:1.6; color:#44403c; margin:0;">
                  Please review the details above and resubmit your application with the corrected documents.
                </p>
                """.formatted(referenceNumber, reason == null || reason.isBlank() ? "Not specified" : reason),
                null, null
        );

        send(to, subject, body, "KYC rejection (ref: " + referenceNumber + ")");
    }
}