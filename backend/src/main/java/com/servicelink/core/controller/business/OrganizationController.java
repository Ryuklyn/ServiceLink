package com.servicelink.core.controller.business;

import com.servicelink.core.dto.request.business.OrganizationRequest;
import com.servicelink.core.dto.request.business.OrganizationUpdateRequest;
import com.servicelink.core.dto.response.business.OrganizationResponse;
import com.servicelink.core.service.business.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/business/organization")
public class OrganizationController {

    private final OrganizationService organizationService;

    @PostMapping
    public ResponseEntity<OrganizationResponse> create(@Valid @RequestBody OrganizationRequest request){
        return ResponseEntity.status(HttpStatus.CREATED).body(organizationService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrganizationResponse> getById(@PathVariable Long id){
        return ResponseEntity.ok(organizationService.findById(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<OrganizationResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody OrganizationUpdateRequest request
    ) {
        try {
            return ResponseEntity.ok(organizationService.update(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping(value = "/{id}/logo", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadLogo(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            return ResponseEntity.ok(organizationService.updateLogo(id, file));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

}
