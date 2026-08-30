package com.servicelink.core.dto.response.business.job;

import com.servicelink.core.model.business.job.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.List;

public record ProJobDetailResponse(
    Long id,
    String reference,
    String title,
    Long serviceCatalogId,
    String category,
    String service,
    Integer workersRequired,
    LocalDate startDate,
    LocalDate endDate,
    LocalTime startTime,
    LocalTime endTime,
    String location,
    Double latitude,
    Double longitude,
    String instructions,
    ProPricingModel pricingModel,
    BigDecimal businessPrice,
    BigDecimal providerEarning,
    ProJobStatus status,
    LocalDateTime createdAt,
    List<AssignedProviderInfo> assignments,
    ProJobBillingInfo billing,
    List<AttendanceInfo> attendance,
    List<SlaInfo> sla
) {
    public record AssignedProviderInfo(
        Long providerId,
        String fullName,
        String businessName,
        String profilePictureUrl,
        String requiredSkill,
        String status
    ) {}

    public record AttendanceInfo(
        Long id,
        Long providerId,
        String providerName,
        Instant checkInTime,
        Instant checkOutTime,
        String status,
        Double latitude,
        Double longitude,
        Double distanceFromJob,
        Boolean locationVerified,
        String rejectionReason
    ) {}

    public record SlaInfo(
        Long id,
        Long providerId,
        String providerName,
        Instant expectedArrival,
        Instant actualArrival,
        Long arrivalDifferenceMinutes,
        String complianceStatus
    ) {}

    public record ProJobBillingInfo(
        Long id,
        BigDecimal estimatedAmount,
        BigDecimal finalAmount,
        String paymentStatus,
        String transactionId,
        String paymentMethod,
        Instant paymentDate,
        String invoiceNumber
    ) {}
}
