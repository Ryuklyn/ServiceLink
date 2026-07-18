package com.servicelink.core.controller.provider.portfolio;

import com.servicelink.core.dto.request.provider.portfolio.CreatePortfolioDTO;
import com.servicelink.core.dto.response.provider.portfolio.PortfolioResponseDTO;
import com.servicelink.core.service.provider.portfolio.PortfolioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/providers/{providerId}/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    /**
     * Matches the "Add Portfolio Work" modal:
     * text fields (title, serviceType, description, completionDate, location)
     * + up to 5 "photos" files + 1 optional "video" file, all multipart/form-data.
     */
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<PortfolioResponseDTO> createProject(
            @PathVariable Long providerId,
            @Valid @ModelAttribute CreatePortfolioDTO request,
            @RequestParam(value = "photos", required = false) List<MultipartFile> photos,
            @RequestParam(value = "video", required = false) MultipartFile video
    ) throws Exception {
        PortfolioResponseDTO response =
                portfolioService.createProject(providerId, request, photos, video);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<PortfolioResponseDTO>> getProjects(
            @PathVariable Long providerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(portfolioService.getProjects(providerId, pageable));
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long providerId,
            @PathVariable Long projectId
    ) {
        portfolioService.deleteProject(providerId, projectId);
        return ResponseEntity.noContent().build();
    }
}
