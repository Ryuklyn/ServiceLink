package com.servicelink.core.controller.business.directory;

import com.servicelink.core.security.CurrentOrganization;
import com.servicelink.core.service.business.directory.ProviderDirectoryService;
import com.servicelink.core.service.business.BusinessAuthorizationService;
import com.servicelink.core.model.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    private final BusinessAuthorizationService businessAuthorizationService;

    /** GET /api/pro/provider-directory?category=HVAC&search=ram */
    @GetMapping
    public List<com.servicelink.core.dto.response.business.pool.ProviderDirectoryCardDTO> list(
            @CurrentOrganization Long organizationId,
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search
    ) {
        businessAuthorizationService.requireDirectoryAccess(user, organizationId);
        return providerDirectoryService.listEligibleForOrganization(organizationId, category, search);
    }
}
