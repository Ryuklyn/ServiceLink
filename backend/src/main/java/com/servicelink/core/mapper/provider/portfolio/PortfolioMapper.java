package com.servicelink.core.mapper.provider.portfolio;

import com.servicelink.core.dto.response.provider.portfolio.PortfolioMediaResponseDTO;
import com.servicelink.core.dto.response.provider.portfolio.PortfolioResponseDTO;
import com.servicelink.core.model.provider.portfolio.Portfolio;
import com.servicelink.core.model.provider.portfolio.PortfolioMedia;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Component
public class PortfolioMapper {

    private static final DateTimeFormatter DISPLAY_FORMAT =
            DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH);

    public PortfolioResponseDTO toResponse(Portfolio project) {
        List<PortfolioMediaResponseDTO> mediaResponses = project.getMedia().stream()
                .map(this::toMediaResponse)
                .collect(Collectors.toList());

        long photoCount = project.getMedia().stream()
                .filter(m -> m.getMediaType() == PortfolioMedia.MediaType.IMAGE)
                .count();

        boolean hasVideo = project.getMedia().stream()
                .anyMatch(m -> m.getMediaType() == PortfolioMedia.MediaType.VIDEO);

        return PortfolioResponseDTO.builder()
                .id(project.getId())
                .title(project.getTitle())
                .serviceCategory(project.getServiceCategory())
                .description(project.getDescription())
                .completionDate(project.getCompletionDate() != null
                        ? project.getCompletionDate().format(DISPLAY_FORMAT)
                        : null)
                .location(project.getLocation())
                .photoCount((int) photoCount)
                .hasVideo(hasVideo)
                .media(mediaResponses)
                .createdAt(project.getCreatedAt())
                .build();
    }

    public PortfolioMediaResponseDTO toMediaResponse(PortfolioMedia media) {
        return PortfolioMediaResponseDTO.builder()
                .id(media.getId())
                .url(media.getMediaUrl())
                .type(media.getMediaType().name())
                .displayOrder(media.getDisplayOrder())
                .build();
    }
}