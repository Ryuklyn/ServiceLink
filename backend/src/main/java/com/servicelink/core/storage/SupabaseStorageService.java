package com.servicelink.core.storage;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ClassicHttpResponse;
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

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    public String uploadFile(MultipartFile file, String folder) throws Exception {

        validateFile(file);

        String fileName =
                UUID.randomUUID() + "_" + file.getOriginalFilename();

        String objectPath = folder + "/" + fileName;

        String uploadUrl =
                supabaseUrl +
                "/storage/v1/object/" +
                supabaseBucket +
                "/" +
                objectPath;

        try (CloseableHttpClient client = HttpClients.createDefault()) {

            HttpPost post = new HttpPost(uploadUrl);

            post.setHeader(
                    "Authorization",
                    "Bearer " + supabaseApiKey
            );

            post.setHeader("apikey", supabaseApiKey);

            post.setHeader(
                    "Content-Type",
                    file.getContentType()
            );

            post.setEntity(
                    new ByteArrayEntity(file.getBytes())
            );

            ClassicHttpResponse response =
                    (ClassicHttpResponse) client.execute(post);

            int statusCode = response.getCode();

            if (statusCode != 200 && statusCode != 201) {
                throw new RuntimeException(
                        "Failed to upload file to Supabase"
                );
            }
        }

        return supabaseUrl +
                "/storage/v1/object/public/" +
                supabaseBucket +
                "/" +
                objectPath;
    }

    private void validateFile(MultipartFile file)
            throws IOException {

        List<String> allowedTypes = List.of(
                "image/jpeg",
                "image/png",
                "application/pdf"
        );

        if (!allowedTypes.contains(file.getContentType())) {
            throw new RuntimeException("Invalid file type");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException(
                    "File size exceeds 10MB"
            );
        }
    }
}