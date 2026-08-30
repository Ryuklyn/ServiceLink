package com.servicelink.core.dto.response.business.job;

import com.servicelink.core.model.business.job.ProJobStatus;
import com.servicelink.core.model.business.job.ProPricingModel;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record ProviderProJobResponse(
    Long id,
    String reference,
    String title,
    String requiredSkill,
    String assignmentStatus,
    LocalDate startDate,
    LocalDate endDate,
    LocalTime startTime,
    LocalTime endTime,
    String location,
    String instructions,
    ProPricingModel pricingModel,
    BigDecimal businessPrice,
    BigDecimal providerEarning,
    ProJobStatus status,
    LocalDateTime createdAt
) {}
