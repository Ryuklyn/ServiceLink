package com.servicelink.core.service;

import com.servicelink.core.dto.request.KycSubmitRequestDTO;
import com.servicelink.core.dto.response.KycStatusResponseDTO;
import com.servicelink.core.dto.response.KycSubmitResponseDTO;
import com.servicelink.mapper.KycMapper;
import com.servicelink.core.model.KycSubmission;
import com.servicelink.core.model.User;
import com.servicelink.core.repository.KycRepository;
import com.servicelink.core.repository.UserRepository;
import com.servicelink.core.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class KycService {

    private final KycRepository kycRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final KycMapper kycMapper;
    private final EmailService emailService;

    @Transactional
    public KycSubmitResponseDTO submit(
            KycSubmitRequestDTO dto,
            MultipartFile citizenshipFront,
            MultipartFile citizenshipBack,
            MultipartFile photo,
            MultipartFile pan,
            MultipartFile[] professionalCerts,
            String userEmail
    ) throws IOException {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (kycRepository.existsByUser(user)) {
            throw new IllegalStateException("KYC already submitted for this account");
        }

        // Upload mandatory documents
        String frontPath = storageService.upload(citizenshipFront, "kyc/citizenship-front");
        String backPath  = storageService.upload(citizenshipBack,  "kyc/citizenship-back");
        String photoPath = storageService.upload(photo, "kyc/photo");

        // Upload optional documents if present
        String panPath = (pan != null && !pan.isEmpty())
                ? storageService.upload(pan, "kyc/pan") : null;

        String certPaths = "[]";
        if (professionalCerts != null && professionalCerts.length > 0) {
            StringBuilder paths = new StringBuilder("[");
            for (MultipartFile cert : professionalCerts) {
                if (!cert.isEmpty()) {
                    paths.append("\"")
                            .append(storageService.upload(cert, "kyc/certs"))
                            .append("\",");
                }
            }
            if (paths.length() > 1) paths.deleteCharAt(paths.length() - 1);
            paths.append("]");
            certPaths = paths.toString();
        }

        KycSubmission submission = kycMapper.toEntity(
                dto, user, frontPath, backPath, photoPath, panPath, certPaths);

        kycRepository.save(submission);

        // Send confirmation email asynchronously
        emailService.sendKycConfirmationEmail(userEmail, submission.getReferenceNumber());

        return kycMapper.toSubmitResponse(submission, userEmail);
    }

    public KycStatusResponseDTO getStatus(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        KycSubmission submission = kycRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("No KYC submission found"));

        return kycMapper.toStatusResponse(submission);
    }
}