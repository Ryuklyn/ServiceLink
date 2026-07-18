package com.servicelink.core.dto.response.provider.portfolio;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioMediaResponseDTO {
    private Long id;
    private String url;
    private String type;
    private Integer displayOrder;
}
