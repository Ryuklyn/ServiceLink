package com.servicelink.core.service.business;

import com.servicelink.core.dto.request.business.WorkspaceRequest;
import com.servicelink.core.dto.request.business.WorkspaceUpdateRequest;
import com.servicelink.core.dto.response.business.WorkspaceResponse;
import com.servicelink.core.mapper.business.WorkspaceMapper;
import com.servicelink.core.model.business.Organization;
import com.servicelink.core.model.business.Workspace;
import com.servicelink.core.repository.business.OrganizationRepository;
import com.servicelink.core.repository.business.WorkspaceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository wRepo;
    private final OrganizationRepository oRepo;
    private final WorkspaceMapper wMapper;
    private final BusinessRegistrationSessionService sessionService;

    @Transactional
    public WorkspaceResponse create(WorkspaceRequest request){
        Organization organization = oRepo.findById(request.getOrganizationId())
                .orElseThrow(() -> new RuntimeException("Organization is not found"));

//        Workspace saved = wRepo.save(wMapper.toEntity(request, organization));
        Workspace saved = wRepo.save(wMapper.toEntity(request, organization));
        sessionService.updateStep(organization.getId(), "WORKSPACE", saved.getId(), null, null);
        return wMapper.toResponse(saved);
    }

    public WorkspaceResponse findById(Long id){
        return wMapper.toResponse(
                wRepo.findById(id)
                        .orElseThrow(() -> new RuntimeException("Workspace not found: " + id)));
    }

    // WorkspaceService
    @Transactional
    public WorkspaceResponse update(Long id, WorkspaceUpdateRequest request) {
        Workspace ws = wRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Workspace not found: " + id));

        if (request.getPrimaryBranchLocation() != null && !request.getPrimaryBranchLocation().isBlank()) {
            ws.setPrimaryBranchLocation(request.getPrimaryBranchLocation());
        }
        if (request.getPreferredServices() != null) {
            ws.setPreferredServices(request.getPreferredServices());
        }
        return wMapper.toResponse(wRepo.save(ws));
    }
}
