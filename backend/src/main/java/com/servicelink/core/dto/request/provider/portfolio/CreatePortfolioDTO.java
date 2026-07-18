package com.servicelink.core.dto.request.provider.portfolio;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreatePortfolioDTO {

    @NotBlank(message = "Project title is required")
    private String title;

    @NotBlank(message = "Service Type is required")
    private String serviceType;

    @NotBlank(message = "Description is required")
    @Size(max = 250, message = "Description must be at most 250 characters")
    private String description;

    private String completionDate;

    private String location;
}
