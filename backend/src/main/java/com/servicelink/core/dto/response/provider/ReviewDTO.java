package com.servicelink.core.dto.response.provider;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ReviewDTO {

    private Long    id;
    private String  customerName;     // from User.fullName / username
    private Integer rating;
    private String  comment;
    private String  serviceName;

    private Integer punctualityScore;
    private Integer qualityScore;
    private Integer communicationScore;
    private Integer valueScore;

    private Boolean isVerifiedBooking;
    private Instant createdAt;
}
