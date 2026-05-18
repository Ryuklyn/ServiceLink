package com.servicelink.core.controller.business;

import com.servicelink.core.dto.request.business.KybRequest;
import com.servicelink.core.dto.response.business.KybResponse;
import com.servicelink.core.service.business.KybService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/business/kyb")
public class KybController {

    private final KybService kybService;

    @PostMapping(value = "/submit",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<KybResponse> submit(
            @RequestPart ("data") @Valid KybRequest request,
            @RequestPart (value = "document", required = false)MultipartFile documentFile
            )throws Exception{
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(kybService.submitKyb(request,documentFile));
    }

    @GetMapping("/organization/{orgId}")
    public ResponseEntity<KybResponse> getByOrg(@PathVariable Long orgId){
        return ResponseEntity.ok(kybService.getKybByOrganization(orgId));
    }
}
