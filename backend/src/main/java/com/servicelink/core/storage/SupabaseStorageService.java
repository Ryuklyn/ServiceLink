package com.servicelink.core.storage;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ClassicHttpResponse;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.io.entity.ByteArrayEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class SupabaseStorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.bucket}")
    private String supabaseBucket;

    @Value("${supabase.api-key}")
    private String supabaseApiKey;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    public String uploadFile(MultipartFile file, String folder) throws Exception {

        validateFile(file);

        // Sanitize original filename to remove spaces and special characters
        String originalName = file.getOriginalFilename();

        String sanitizedName = originalName == null
                ? "file"
                : originalName
                        .replaceAll("[^a-zA-Z0-9._-]", "_")
                        .replaceAll("_+", "_");

        // Generate unique filename
        String fileName = UUID.randomUUID() + "_" + sanitizedName;

        // Full object path inside the bucket
        String objectPath = folder + "/" + fileName;

        // Supabase upload endpoint
        String uploadUrl = supabaseUrl
                + "/storage/v1/object/"
                + supabaseBucket
                + "/"
                + objectPath;

        // Determine content type
        String contentType = file.getContentType() != null
                ? file.getContentType()
                : "application/octet-stream";

        try (CloseableHttpClient client = HttpClients.createDefault()) {

            HttpPost post = new HttpPost(uploadUrl);

            // Required Supabase headers
            post.setHeader("Authorization", "Bearer " + supabaseApiKey);
            post.setHeader("apikey", supabaseApiKey);
            post.setHeader("Content-Type", contentType);

            // Create entity with file bytes
            ByteArrayEntity entity = new ByteArrayEntity(
                    file.getBytes(),
                    ContentType.parse(contentType),
                    null
            );

            post.setEntity(entity);

            // Execute upload
            ClassicHttpResponse response =
                    (ClassicHttpResponse) client.execute(post);

            int statusCode = response.getCode();

            // Accept 200 OK and 201 Created
            if (statusCode != 200 && statusCode != 201) {
                throw new RuntimeException(
                        "Failed to upload file to Supabase. Status code: "
                                + statusCode
                );
            }
        }

        // Return public URL
        return getPublicUrl(objectPath);
    }

    /**
     * Returns the public URL for a file stored in Supabase.
     *
     * Example:
     * https://your-project.supabase.co/storage/v1/object/public/
     * servicelink-files/kyc/photo/uuid_file.jpg
     */
    public String getPublicUrl(String objectPath) {
        return supabaseUrl
                + "/storage/v1/object/public/"
                + supabaseBucket
                + "/"
                + objectPath;
    }

    // ===================== PRIVATE METHODS =====================

    private void validateFile(MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        List<String> allowedTypes = List.of(
                "image/jpeg",
                "image/jpg",
                "image/png",
                "video/mp4",
                "video/mpeg4",
                "video/quicktime",
                "video/webm",
                "application/pdf"
        );

        String contentType = file.getContentType();

        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new RuntimeException(
                    "Invalid file type. Allowed types: JPG, JPEG, PNG, PDF"
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds 10MB");
        }
    }
}