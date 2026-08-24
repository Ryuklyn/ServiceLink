package com.servicelink.core.controller.business.directory;

import com.servicelink.core.security.CurrentOrganization;
import com.servicelink.core.service.business.directory.ProviderDirectoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/pro/provider-directory")
public class ProviderDirectoryController {

    private final ProviderDirectoryService providerDirectoryService;

    /** GET /api/pro/provider-directory?category=HVAC&search=ram */
    @GetMapping
    public List<com.servicelink.core.dto.response.business.pool.ProviderDirectoryCardDTO> list(
            @CurrentOrganization Long organizationId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search
    ) {
        return providerDirectoryService.listEligibleForOrganization(organizationId, category, search);
    }
}