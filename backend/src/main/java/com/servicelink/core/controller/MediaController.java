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

        String folder = file.getContentType()!= null
                && file.getContentType().startsWith("video/") ? "videos" : "images";

        String url = supabaseStorageService.uploadFile(file, folder);

        return ResponseEntity.ok().body(Map.of("url", url));

    }
}
