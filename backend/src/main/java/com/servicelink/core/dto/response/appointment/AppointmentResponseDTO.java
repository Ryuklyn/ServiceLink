//package com.servicelink.core.dto.response.appointment;
//
//import com.servicelink.core.model.appointment.AppointmentStatus;
//import com.servicelink.core.model.common.TimeSlot;
//import com.servicelink.core.model.provider.ServiceCatalog;
//import lombok.Builder;
//import lombok.Data;
//
//import java.time.LocalDateTime;
//
//@Data
//@Builder
//public class AppointmentResponseDTO {
//
//    private Long id;
//
//    private Long providerId;
//    private String providerName;
//    private String providerPhone;
//    private String providerProfilePicture;
//
//    private Long serviceCatalogId;
//    private String subServiceName;
//    private ServiceCatalog.PricingUnit pricingUnit;
//    private String effectiveDuration;
//    private Integer providerCustomPrice;
//
//    private Integer totalPrice;
//    private TimeSlot timeSlot;
//    private LocalDateTime scheduledAt;
//    private LocalDateTime estimatedStartTime;
//    private LocalDateTime estimatedEndTime;
//
//    private String attachedImgUrl;
//    private String attachedVideoUrl;
//
//    private String address;
//    private String notes;
//
//    private AppointmentStatus status;
//
//}


// com/servicelink/core/dto/response/appointment/AppointmentResponseDTO.java
package com.servicelink.core.dto.response.appointment;

import com.servicelink.core.model.appointment.AppointmentStatus;
import com.servicelink.core.model.common.TimeSlot;
import com.servicelink.core.model.provider.ServiceCatalog;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
public class AppointmentResponseDTO {

    private Long id;

    // ── Provider Snapshot ─────────────────────────────────────────────────────
    private Long   providerId;
    private String providerName;
    private String providerPhone;
    private String providerProfilePicture;

    // ── Service Snapshot ──────────────────────────────────────────────────────
    private Long                       serviceCatalogId;
    private String                     subServiceName;
    private ServiceCatalog.PricingUnit pricingUnit;
    private String                     effectiveDuration;
    private Integer                    providerCustomPrice;

    // ── Pricing ───────────────────────────────────────────────────────────────
    private Integer totalPrice;
    private Integer areaSqFt;
    private Integer wallCount;
    private Integer itemCount;

    // ── Scheduling ────────────────────────────────────────────────────────────
    private LocalDate     appointmentDate;
    private TimeSlot      timeSlot;
    private LocalDateTime scheduledAt;
    private LocalTime     estimatedStartTime;
    private LocalTime     estimatedEndTime;

    // ── Attachments ───────────────────────────────────────────────────────────
    private String attachedImgUrl;
    private String attachedVideoUrl;
    private String attachedAudioUrl;

    // ── Logistics ─────────────────────────────────────────────────────────────
    private String address;
    private String notes;

    // ── Status & Audit ────────────────────────────────────────────────────────
    private AppointmentStatus status;
    private String            cancellationReason;
    private LocalDateTime     confirmedAt;
    private LocalDateTime     startedAt;
    private LocalDateTime     completedAt;
    private LocalDateTime     cancelledAt;

    // ── Customer Snapshot ─────────────────────────────────────────────────────
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String customerProfilePictureUrl;
}
