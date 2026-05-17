package com.servicelink.core.service.business;

import com.servicelink.core.dto.request.business.KybRequest;
import com.servicelink.core.dto.response.business.KybResponse;
import com.servicelink.core.mapper.business.KybMapper;
import com.servicelink.core.model.business.KybStatus;
import com.servicelink.core.model.business.KybVerification;
import com.servicelink.core.model.business.Organization;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import com.servicelink.core.mapper.KycMapper;
import com.servicelink.core.repository.business.KybVerificationRepository;
import com.servicelink.core.repository.business.OrganizationRepository;
import com.servicelink.core.storage.SupabaseStorageService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class KybService {
    
     private final KybVerificationRepository kRepo;
     private final OrganizationRepository oRepo;
     private final SupabaseStorageService storageService;
     private final KybMapper kMapper;

     @Transactional
     public KybResponse submitKyb(KybRequest request, MultipartFile documentFile) throws Exception{
          Organization organization = oRepo.findById(request.getOrganizationId())
                  .orElseThrow(() -> new RuntimeException("Organization is not found."));


          if (kRepo.findByOrganizationId(organization.getId()).isPresent()){
               throw new IllegalStateException("KYC for this application has already been submitted");
          }

          String documentUrl = null;

          if (documentFile != null && !documentFile.isEmpty()){
               documentUrl = storageService.uploadFile(documentFile, "kyb/documents");
          }

          KybVerification kyb = KybVerification.builder()
                  .organization(organization)
                  .taxId(request.getTaxId().trim().toUpperCase())
                  .documentImgUrl(documentUrl)
                  .authorizedConfirmed(request.getAuthorizedConfirmed())
                  .status(KybStatus.PENDING)
                  .build();

          return kMapper.toResponse(kRepo.save(kyb));
     }

     public KybResponse getKybByOrganization(Long oragnizationId){
          return kMapper.toResponse(
                  kRepo.findByOrganizationId(oragnizationId)
                          .orElseThrow(() ->
                                  new RuntimeException("Kyb is not found for this organization id" + oragnizationId))

          );
     }

     
}
