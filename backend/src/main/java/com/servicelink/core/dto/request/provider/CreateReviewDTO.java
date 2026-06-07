package com.servicelink.core.dto.request.provider;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateReviewDTO {

    @NotNull
    private Long providerId;

    @NotNull
    private Long appointmentId;

    @NotNull
    @Min(1) @Max(5)
    private Integer rating;

    @Size(max = 2000)
    private String comment;

    @Min(0) @Max(100)
    private Integer punctualityScore;

    @Min(0) @Max(100)
    private Integer qualityScore;

    @Min(0) @Max(100)
    private Integer communicationScore;

    @Min(0) @Max(100)
    private Integer valueScore;
}

