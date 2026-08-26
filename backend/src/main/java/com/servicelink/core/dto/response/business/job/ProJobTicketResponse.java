package com.servicelink.core.dto.response.business.job;

import com.servicelink.core.model.business.job.*;
import java.math.BigDecimal;
import java.time.*;

public record ProJobTicketResponse(Long id, String reference, String title, Long serviceCatalogId,
        String category, String service, Integer workersRequired, LocalDate scheduledDate,
        LocalTime startTime, LocalTime endTime, String location, String instructions,
        ProPricingModel pricingModel, BigDecimal businessPrice, BigDecimal providerEarning,
        ProJobStatus status, LocalDateTime createdAt) { }
