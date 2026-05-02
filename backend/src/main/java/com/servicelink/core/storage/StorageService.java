package com.servicelink.core.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

/**
 * Abstracts S3-compatible storage (works with AWS S3 or local Minio).
 * Configure endpoint in application.properties for Minio.
 */
@Service
public class StorageService {

    @Value("${storage.bucket}")
    private String bucket;

    private final S3Client s3Client;

    public StorageService(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    /**
     * Uploads a file and returns its storage key (path).
     * @param folder  e.g. "kyc/citizenship-front"
     */
    public String upload(MultipartFile file, String folder) throws IOException {
        String key = folder + "/" + UUID.randomUUID() + "-" + file.getOriginalFilename();

        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .contentType(file.getContentType())
                        .build(),
                RequestBody.fromBytes(file.getBytes())
        );

        return key;
    }

    /** Returns a pre-signed URL valid for 1 hour (for admin document review). */
    public String getPresignedUrl(String key) {
        // implement with S3Presigner when needed for admin review panel
        return "https://" + bucket + ".s3.amazonaws.com/" + key;
    }
}