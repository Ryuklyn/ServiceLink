package com.servicelink.core.service.business;

import com.servicelink.core.dto.request.business.OrganizationRequest;
import com.servicelink.core.dto.request.business.OrganizationUpdateRequest;
import com.servicelink.core.dto.response.business.OrganizationResponse;
import com.servicelink.core.mapper.business.OrganizationMapper;
import com.servicelink.core.model.business.Organization;
import com.servicelink.core.repository.business.OrganizationRepository;
import com.servicelink.core.storage.SupabaseStorageService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository oRepo;
    private final OrganizationMapper oMapper;
    private final BusinessRegistrationSessionService sessionService;
    private final SupabaseStorageService storageService;

    @Transactional
    public OrganizationResponse create(OrganizationRequest request){
        if (oRepo.existsByWorkEmail(request.getWorkEmail())) {
            throw new IllegalArgumentException("An organization with this email already exists.");
        }
        if (oRepo.existsByContactNumber(request.getContactNumber())) {
            throw new IllegalArgumentException("This contact number is already registered as a business account");
        }
//        Organization saved = oRepo.save(oMapper.toEntity(request));
        Organization saved = oRepo.save(oMapper.toEntity(request));
        sessionService.updateStep(saved.getId(), "ORGANIZATION", null, null, null);
        return oMapper.toResponse(saved);
    }

    public OrganizationResponse findById(Long id){
        Organization organization = oRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found: " + id));
        return oMapper.toResponse(organization);
    }

    @Transactional
    public OrganizationResponse update(Long id, OrganizationUpdateRequest request) {
        Organization org = oRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found: " + id));

        if (request.getCompanyName() != null && !request.getCompanyName().isBlank()) {
            org.setCompanyName(request.getCompanyName());
        }
        if (request.getContactNumber() != null && !request.getContactNumber().isBlank()) {
            org.setContactNumber(request.getContactNumber());
        }

        return oMapper.toResponse(oRepo.save(org));
    }

    @Transactional
    public OrganizationResponse updateLogo(Long id, MultipartFile file) throws Exception {
        Organization org = oRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found: " + id));

        String url = storageService.uploadFile(file, "organization-logos");
        org.setLogoUrl(url);

        return oMapper.toResponse(oRepo.save(org));
    }
}
