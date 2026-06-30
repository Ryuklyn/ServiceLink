package com.servicelink.core.controller;

import com.servicelink.core.storage.SupabaseStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final SupabaseStorageService supabaseStorageService;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) throws Exception {

        String contentType = file.getContentType();

        String folder;
        if (contentType != null && contentType.startsWith("video/")) {
            folder = "videos";
        } else if (contentType != null && contentType.startsWith("audio/")) {
            folder = "voice-notes";
        } else {
            folder = "images";
        }

        String url = supabaseStorageService.uploadFile(file, folder);

        return ResponseEntity.ok().body(Map.of("url", url));
    }
}
