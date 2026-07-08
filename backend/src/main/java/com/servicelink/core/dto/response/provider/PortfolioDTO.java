package com.servicelink.core.dto.response.provider;

import com.servicelink.core.model.provider.portfolio.Portfolio;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class PortfolioDTO {

    private Long              id;
    private String            mediaUrl;
    private Portfolio.MediaType mediaType;
    private String            caption;
    private String            serviceCategory;
    private Boolean           isPrimary;
    private Instant           uploadedAt;
}

