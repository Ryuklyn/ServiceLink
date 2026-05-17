package com.servicelink.core.service.business;

import com.servicelink.core.dto.request.business.OrganizationRequest;
import com.servicelink.core.dto.response.business.OrganizationResponse;
import com.servicelink.core.mapper.business.OrganizationMapper;
import com.servicelink.core.model.business.Organization;
import com.servicelink.core.repository.business.OrganizationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository oRepo;
    private final OrganizationMapper oMapper;

    @Transactional
    public OrganizationResponse create(OrganizationRequest request){
        if (oRepo.existsByWorkEmail(request.getWorkEmail())) {
            throw new IllegalArgumentException("An organization with this email already exists.");
        }
        Organization saved = oRepo.save(oMapper.toEntity(request));
        return oMapper.toResponse(saved);
    }

    public OrganizationResponse findById(Long id){
        Organization organization = oRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found: " + id));
        return oMapper.toResponse(organization);
    }

}
