// com/servicelink/core/mapper/AppointmentMapper.java
package com.servicelink.core.mapper;

import com.servicelink.core.dto.response.appointment.AppointmentResponseDTO;
import com.servicelink.core.dto.response.appointment.AppointmentSummaryDTO;
import com.servicelink.core.model.appointment.Appointment;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.provider.ProviderService;
import com.servicelink.core.model.provider.ServiceCatalog;
import org.springframework.stereotype.Component;

@Component
public class AppointmentMapper {

    /**
     * Full detail response.
     * Used after booking creation and for the detail endpoint.
     *
     * providerService is resolved in the service layer because Appointment only
     * holds a ServiceCatalog FK — the ProviderService (price + duration) must
     * be looked up separately and injected here.
     */
    public AppointmentResponseDTO toResponseDTO(Appointment appt, ProviderService ps) {
        Provider       provider = appt.getProvider();
        ServiceCatalog catalog  = appt.getServiceCatalog();

        return AppointmentResponseDTO.builder()
                .id(appt.getId())
                // Provider
                .providerId(provider.getId())
                .providerName(provider.getFullName())
                .providerPhone(provider.getPhone())
                .providerProfilePicture(provider.getProfilePictureUrl())
                // Service
                .serviceCatalogId(catalog.getId())
                .subServiceName(catalog.getSubServiceName())
                .pricingUnit(catalog.getPricingUnit())
                .effectiveDuration(ps != null ? ps.getEffectiveDuration() : catalog.getDefaultDuration())
                .providerCustomPrice(ps != null ? ps.getCustomPrice() : null)
                // Pricing
                .totalPrice(appt.getTotalPrice())
                .areaSqFt(appt.getAreaSqFt())
                .wallCount(appt.getWallCount())
                .itemCount(appt.getItemCount())
                // Scheduling
                .appointmentDate(appt.getAppointmentDate())
                .timeSlot(appt.getTimeSlot())
                .scheduledAt(appt.getScheduledAt())
                .estimatedStartTime(appt.getEstimatedStartTime())
                .estimatedEndTime(appt.getEstimatedEndTime())
                // Attachments
                .attachedImgUrl(appt.getAttachedImgUrl())
                .attachedVideoUrl(appt.getAttachedVideoUrl())
                // Logistics
                .address(appt.getAddress())
                .notes(appt.getNotes())
                // Status & Audit
                .status(appt.getStatus())
                .cancellationReason(appt.getCancellationReason())
                .confirmedAt(appt.getConfirmedAt())
                .startedAt(appt.getStartedAt())
                .completedAt(appt.getCompletedAt())
                .cancelledAt(appt.getCancelledAt())
                .build();
    }

    /**
     * Lightweight summary for dashboard list cards and paged views.
     * Does NOT require ProviderService — all fields live on Appointment.
     */
    public AppointmentSummaryDTO toSummaryDTO(Appointment appt) {
        return AppointmentSummaryDTO.builder()
                .id(appt.getId())
                .providerName(appt.getProvider().getFullName())
                .providerProfilePicture(appt.getProvider().getProfilePictureUrl())
                .subServiceName(appt.getServiceCatalog().getSubServiceName())
                .appointmentDate(appt.getAppointmentDate())
                .timeSlot(appt.getTimeSlot())
                .estimatedStartTime(appt.getEstimatedStartTime())
                .status(appt.getStatus())
                .totalPrice(appt.getTotalPrice())
                .address(appt.getAddress())
                .build();
    }
}
