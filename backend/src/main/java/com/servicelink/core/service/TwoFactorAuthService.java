package com.servicelink.core.service;

import dev.samstevens.totp.code.*;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import dev.samstevens.totp.exceptions.QrGenerationException;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TwoFactorAuthService {

    private static final String ISSUER = "ServiceLink";
    private final SecretGenerator secretGenerator = new DefaultSecretGenerator();
    private final QrGenerator qrGenerator = new ZxingPngQrGenerator();
    private final TimeProvider timeProvider = new SystemTimeProvider();
    private final CodeGenerator codeGenerator = new DefaultCodeGenerator();
    private final CodeVerifier codeVerifier = new DefaultCodeVerifier(codeGenerator, timeProvider);

    public String generateSecret() {
        return secretGenerator.generate();
    }

    public String generateQrCodeBase64(String secret, String accountEmail) {
        QrData data = new QrData.Builder()
                .label(accountEmail)
                .secret(secret)
                .issuer(ISSUER)
                .algorithm(HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();

        try {
            byte[] png = qrGenerator.generate(data);
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(png);
        } catch (QrGenerationException e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    public boolean verifyCode(String secret, String code) {
        return codeVerifier.isValidCode(secret, code);
    }

    /** Generates N human-readable backup codes, e.g. "XXXX-XXXX" */
    public List<String> generatePlaintextBackupCodes(int count) {
        SecureRandom random = new SecureRandom();
        List<String> codes = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            String code = String.format("%04d-%04d", random.nextInt(10000), random.nextInt(10000));
            codes.add(code);
        }
        return codes;
    }

//    public List<String> hashBackupCodes(List<String> plaintextCodes) {
//        return plaintextCodes.stream()
//                .map(c -> BCrypt.hashpw(c, BCrypt.gensalt()))
//                .toList();
//    }

    public List<String> hashBackupCodes(List<String> plaintextCodes) {
        return plaintextCodes.stream()
                .map(c -> BCrypt.hashpw(c, BCrypt.gensalt()))
                .collect(Collectors.toCollection(ArrayList::new));
    }

    public boolean matchesAnyBackupCode(String rawCode, List<String> hashedCodes) {
        return hashedCodes.stream().anyMatch(hash -> BCrypt.checkpw(rawCode, hash));
    }
}
