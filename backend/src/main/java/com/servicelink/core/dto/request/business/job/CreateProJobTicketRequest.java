package com.servicelink.core.dto.request.business.job;

import com.servicelink.core.model.business.job.ProPricingModel;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.*;

public record CreateProJobTicketRequest(
        @NotNull Long serviceCatalogId, @NotBlank @Size(max = 160) String title,
        @NotNull @Min(1) Integer workersRequired, @NotNull @FutureOrPresent LocalDate scheduledDate,
        @NotNull LocalTime startTime, @NotNull LocalTime endTime, @NotBlank @Size(max = 512) String location,
        Double latitude, Double longitude, @Size(max = 4000) String instructions,
        @NotNull ProPricingModel pricingModel, @NotNull @DecimalMin("0.00") BigDecimal businessPrice,
        @NotNull @DecimalMin("0.00") BigDecimal providerEarning) { }
