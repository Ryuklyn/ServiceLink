package com.servicelink.core.service.admin;

import com.servicelink.core.dto.response.admin.AdminB2BClientDTO;
import com.servicelink.core.model.business.KybVerification;
import com.servicelink.core.model.business.Organization;
import com.servicelink.core.model.business.ProUser;
import com.servicelink.core.model.business.Subscription;
import com.servicelink.core.model.business.Workspace;
import com.servicelink.core.repository.business.KybVerificationRepository;
import com.servicelink.core.repository.business.OrganizationRepository;
import com.servicelink.core.repository.business.ProUserRepository;
import com.servicelink.core.repository.business.SubscriptionRepository;
import com.servicelink.core.repository.business.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminB2BService {
    private final OrganizationRepository organizationRepository;
    private final WorkspaceRepository workspaceRepository;
    private final ProUserRepository proUserRepository;
    private final KybVerificationRepository kybRepository;
    private final SubscriptionRepository subscriptionRepository;

    @Transactional(readOnly = true)
    public List<AdminB2BClientDTO> listClients() {
        return organizationRepository.findAll().stream()
                .sorted(Comparator.comparing(Organization::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toResponse)
                .filter(client -> client.getAdminUserId() != null)
                .toList();
    }

    private AdminB2BClientDTO toResponse(Organization organization) {
        Workspace workspace = workspaceRepository.findByOrganizationId(organization.getId()).stream().findFirst().orElse(null);
        ProUser proUser = workspace == null ? null : proUserRepository.findByWorkspaceId(workspace.getId()).orElse(null);
        KybVerification kyb = kybRepository.findByOrganizationId(organization.getId()).orElse(null);
        Subscription subscription = workspace == null ? null : subscriptionRepository.findByWorkspaceId(workspace.getId()).orElse(null);

        return AdminB2BClientDTO.builder()
                .organizationId(organization.getId())
                .workspaceId(workspace != null ? workspace.getId() : null)
                .proUserId(proUser != null ? proUser.getId() : null)
                .adminUserId(proUser != null && proUser.getUser() != null ? proUser.getUser().getId() : null)
                .companyName(organization.getCompanyName())
                .businessType(organization.getBusinessType() != null ? organization.getBusinessType().name() : null)
                .companySize(organization.getCompanySize() != null ? organization.getCompanySize().name() : null)
                .workEmail(organization.getWorkEmail())
                .contactNumber(organization.getContactNumber())
                .workspaceName(workspace != null ? workspace.getName() : null)
                .primaryBranchLocation(workspace != null ? workspace.getPrimaryBranchLocation() : null)
                .adminName(proUser != null ? proUser.getFullName() : null)
                .adminEmail(proUser != null && proUser.getUser() != null ? proUser.getUser().getEmail() : null)
                .taxId(kyb != null ? kyb.getTaxId() : null)
                .kybStatus(kyb != null ? kyb.getStatus() : null)
                .registrationStatus(organization.getRegistrationStatus())
                .planType(subscription != null ? subscription.getPlanType() : null)
                .subscriptionStatus(subscription != null ? subscription.getSubscriptionStatus() : null)
                .createdAt(organization.getCreatedAt())
                .build();
    }
}
