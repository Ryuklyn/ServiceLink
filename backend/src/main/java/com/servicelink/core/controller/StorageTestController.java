package com.servicelink.core.controller;

import com.servicelink.core.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class StorageTestController {

    private final StorageService storageService;

    /**
     * POST /api/test/upload - Test file upload to Supabase
     */
    @PostMapping("/upload")
    public ResponseEntity<?> testUpload(@RequestParam("file") MultipartFile file) {
        try {
            String url = storageService.upload(file, "test");
            return ResponseEntity.ok(Map.of(
                "success", true,
                "url", url,
                "message", "File uploaded to Supabase successfully!"
            ));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * GET /api/test/health - Quick health check
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "ok",
            "message", "Storage service is ready"
        ));
    }
}
