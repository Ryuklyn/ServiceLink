package com.servicelink.core.service.provider.portfolio;

import com.servicelink.core.dto.response.provider.portfolio.PortfolioResponseDTO;
import com.servicelink.core.mapper.provider.portfolio.PortfolioMapper;
import com.servicelink.core.dto.request.provider.portfolio.CreatePortfolioDTO;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.provider.portfolio.Portfolio;
import com.servicelink.core.model.provider.portfolio.PortfolioMedia;
import com.servicelink.core.repository.provider.ProviderRepository; // adjust to your actual package
import com.servicelink.core.repository.provider.portfolio.PortfolioRepository;
import com.servicelink.core.storage.SupabaseStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private static final int MAX_PROJECTS = 10;
    private static final int MAX_PHOTOS = 5;

    private final PortfolioRepository portfolioRepository;
    private final ProviderRepository providerRepository;
    private final SupabaseStorageService supabaseStorageService;
    private final PortfolioMapper portfolioMapper;

    @Transactional
    public PortfolioResponseDTO createProject(
            Long providerId,
            CreatePortfolioDTO request,
            List<MultipartFile> photos,
            MultipartFile video
    ) throws Exception {

        long existingCount = portfolioRepository.countByProviderId(providerId);
        if (existingCount >= MAX_PROJECTS) {
            throw new IllegalStateException("Maximum of " + MAX_PROJECTS + " portfolio projects allowed.");
        }

        if (photos != null && photos.size() > MAX_PHOTOS) {
            throw new IllegalArgumentException("Maximum of " + MAX_PHOTOS + " photos allowed per project.");
        }

        Provider provider = providerRepository.getReferenceById(providerId);

        Portfolio project = Portfolio.builder()
                .provider(provider)
                .title(request.getTitle())
                .serviceCategory(request.getServiceType())
                .description(request.getDescription())
                .completionDate(parseCompletionDate(request.getCompletionDate()))
                .location(request.getLocation())
                .build();

        // Upload each photo to Supabase, then attach the returned URL as media
        if (photos != null) {
            int order = 0;
            for (MultipartFile photo : photos) {
                if (photo == null || photo.isEmpty()) continue;
                String url = supabaseStorageService.uploadFile(photo, "portfolio/" + providerId + "/photos");
                PortfolioMedia media = PortfolioMedia.builder()
                        .mediaUrl(url)
                        .mediaType(PortfolioMedia.MediaType.IMAGE)
                        .displayOrder(order++)
                        .build();
                project.addMedia(media);
            }
        }

        // Upload the optional video (max 1)
        if (video != null && !video.isEmpty()) {
            String url = supabaseStorageService.uploadFile(video, "portfolio/" + providerId + "/videos");
            PortfolioMedia media = PortfolioMedia.builder()
                    .mediaUrl(url)
                    .mediaType(PortfolioMedia.MediaType.VIDEO)
                    .displayOrder(0)
                    .build();
            project.addMedia(media);
        }

        Portfolio saved = portfolioRepository.save(project);
        return portfolioMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<PortfolioResponseDTO> getProjects(Long providerId, Pageable pageable) {
        return portfolioRepository.findByProviderId(providerId, pageable)
                .map(portfolioMapper::toResponse);
    }

    @Transactional
    public void deleteProject(Long providerId, Long projectId) {
        if (!portfolioRepository.existsByIdAndProviderId(projectId, providerId)) {
            throw new IllegalArgumentException("Project not found for this provider.");
        }
        portfolioRepository.deleteById(projectId);
        // Note: this deletes the DB rows only. If you also want the files removed
        // from Supabase storage, add a deleteFile(objectPath) method to
        // SupabaseStorageService and call it here for each PortfolioMedia first.
    }

    private LocalDate parseCompletionDate(String monthValue) {
        if (monthValue == null || monthValue.isBlank()) return null;
        // <input type="month"> submits "yyyy-MM" — pad to a full ISO date
        return LocalDate.parse(monthValue + "-01", DateTimeFormatter.ISO_DATE);
    }
}
