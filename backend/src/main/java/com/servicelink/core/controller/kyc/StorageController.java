package com.servicelink.core.controller.kyc;

import com.servicelink.core.dto.response.kyc.FileUploadResponse;
import com.servicelink.core.storage.SupabaseStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/storage")
public class StorageController {

    // Concrete class inject gareko - kunai interface xaina StorageService ra
    // SupabaseStorageService bich, so ambiguity xaina, tara explicit type
    // reference le pachi arkole "StorageService" (local disk) galti le
    // inject gari halna sakdaina
    private final SupabaseStorageService storageService;

    private static final Set<String> ALLOWED_SCOPES = Set.of("kyc-drafts");

    public StorageController(SupabaseStorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<?> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("folder") String folder
    ) {
        String scope = folder.split("/", 2)[0];

        if (!ALLOWED_SCOPES.contains(scope)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid folder scope: " + scope));
        }

        try {
            String url = storageService.uploadFile(file, folder);
            return ResponseEntity.ok(new FileUploadResponse(url));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Upload failed"));
        }
    }
}