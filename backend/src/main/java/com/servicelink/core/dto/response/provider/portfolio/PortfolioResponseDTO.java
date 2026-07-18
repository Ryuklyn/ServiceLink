package com.servicelink.core.dto.response.provider.portfolio;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioResponseDTO {
    private Long id;
    private String title;
    private String serviceCategory;
    private String description;
    private String completionDate;
    private String location;
    private int photoCount;
    private boolean hasVideo;
    private List<PortfolioMediaResponseDTO> media;
    private Instant createdAt;

}

