package com.servicelink.core.mapper.appointment;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.servicelink.core.dto.response.appointment.AppointmentResponseDTO;
import com.servicelink.core.dto.response.appointment.AppointmentSummaryDTO;
import com.servicelink.core.model.appointment.Appointment;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.provider.ProviderService;
import com.servicelink.core.model.provider.ServiceCatalog;
import com.servicelink.core.model.user.User;
import com.servicelink.core.model.user.UserProfile;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
public class AppointmentMapper {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public AppointmentResponseDTO toResponseDTO(Appointment appt, ProviderService ps, User customer) {
        Provider          provider = appt.getProvider();
        ServiceCatalog    catalog  = appt.getServiceCatalog();
        CustomerSnapshot  snapshot = CustomerSnapshot.of(customer);

        return AppointmentResponseDTO.builder()
                .id(appt.getId())
                .providerId(provider.getId())
                .providerName(provider.getFullName())
                .providerPhone(provider.getPhone())
                .providerProfilePicture(provider.getProfilePictureUrl())
                .serviceCatalogId(catalog.getId())
                .subServiceName(catalog.getSubServiceName())
                .pricingUnit(catalog.getPricingUnit())
                .effectiveDuration(ps != null ? ps.getEffectiveDuration() : catalog.getDefaultDuration())
                .providerCustomPrice(ps != null ? ps.getCustomPrice() : null)
                .totalPrice(appt.getTotalPrice())
                .areaSqFt(appt.getAreaSqFt())
                .wallCount(appt.getWallCount())
                .itemCount(appt.getItemCount())
                .appointmentDate(appt.getAppointmentDate())
                .timeSlot(appt.getTimeSlot())
                .scheduledAt(appt.getScheduledAt())
                .estimatedStartTime(appt.getEstimatedStartTime())
                .estimatedEndTime(appt.getEstimatedEndTime())
                .previousAppointmentDate(appt.getPreviousAppointmentDate())
                .previousTimeSlot(appt.getPreviousTimeSlot())
                .rescheduledAt(appt.getRescheduledAt())
                .attachedImgUrl(appt.getAttachedImgUrl())
                .attachedVideoUrl(appt.getAttachedVideoUrl())
                .attachedAudioUrl(appt.getAttachedAudioUrl())
                .address(appt.getAddress())
                .notes(appt.getNotes())
                .status(appt.getStatus())
                .cancellationReason(appt.getCancellationReason())
                .confirmedAt(appt.getConfirmedAt())
                .startedAt(appt.getStartedAt())
                .completedAt(appt.getCompletedAt())
                .cancelledAt(appt.getCancelledAt())
                .hours(appt.getHours())
                .operationalStatus(appt.getOperationalStatus())
                .estimatedAmount(appt.getEstimatedAmount())
                .finalAmount(appt.getFinalAmount())
                .paymentStatus(appt.getPaymentStatus())
                .paymentMethod(appt.getPaymentMethod())
                .completionNote(appt.getCompletionNote())
                .selectedServices(parseSelectedServices(appt))
                .completedServices(parseCompletedServices(appt))
                .providerRate(appt.getProviderRate())
                // Customer snapshot — name/phone/photo resolved from UserProfile,
                // email is the one field that legitimately lives on User itself.
                .customerName(snapshot.name())
                .customerPhone(snapshot.phone())
                .customerEmail(customer != null ? customer.getEmail() : null)
                .customerProfilePictureUrl(snapshot.photo())
                .build();
    }

    public AppointmentSummaryDTO toSummaryDTO(Appointment appt, User customer) {
        CustomerSnapshot snapshot = CustomerSnapshot.of(customer);

        return AppointmentSummaryDTO.builder()
                .id(appt.getId())
                .providerId(appt.getProvider().getId())
                .providerName(appt.getProvider().getFullName())
                .providerPhone(appt.getProvider().getPhone())
                .providerProfilePicture(appt.getProvider().getProfilePictureUrl())
                .subServiceName(appt.getServiceCatalog().getSubServiceName())
                .appointmentDate(appt.getAppointmentDate())
                .timeSlot(appt.getTimeSlot())
                .estimatedStartTime(appt.getEstimatedStartTime())
                .previousAppointmentDate(appt.getPreviousAppointmentDate())
                .previousTimeSlot(appt.getPreviousTimeSlot())
                .rescheduledAt(appt.getRescheduledAt())
                .status(appt.getStatus())
                .totalPrice(appt.getTotalPrice())
                .estimatedAmount(appt.getEstimatedAmount())
                .finalAmount(appt.getFinalAmount())
                .paymentStatus(appt.getPaymentStatus())
                .paymentMethod(appt.getPaymentMethod())
                .selectedServiceNames(parseSelectedServices(appt).stream()
                        .map(AppointmentResponseDTO.SelectedServiceDTO::getSubServiceName)
                        .toList())
                .address(appt.getAddress())
                .operationalStatus(appt.getOperationalStatus())
                .hours(appt.getHours())
                .serviceCatalogId(appt.getServiceCatalog().getId())
                .customerName(snapshot.name())
                .customerPhone(snapshot.phone())
                .customerProfilePictureUrl(snapshot.photo())
                .build();
    }

    /**
     * Resolves the fields both DTOs need from a customer in one place, so the
     * null-checks and the UserProfile-vs-User source-of-truth decision only
     * live in one spot instead of being copy-pasted across two builders.
     *
     * IMPORTANT: fullName, phoneNumber, and profileImage all live on
     * UserProfile (one-to-one with User via user_id) — NOT on User itself.
     * `User` apparently also exposes its own `getFullName()` (that's why the
     * old `customer.getFullName()` call compiled at all), but that's a
     * separate/legacy field and reading it here was the actual bug: it
     * silently returned null/blank while `customer` was non-null, since the
     * real name was sitting on `customer.getProfile().getFullName()` instead.
     *
     * If `User.fullName` is meant to be removed entirely, that's an entity
     * change outside this file — flagging it here so it isn't lost.
     */
    private record CustomerSnapshot(String name, String phone, String photo) {

        static CustomerSnapshot of(User customer) {
            if (customer == null) {
                return new CustomerSnapshot("Unknown", null, null);
            }

            UserProfile profile = customer.getProfile();

            String name = (profile != null && profile.getFullName() != null && !profile.getFullName().isBlank())
                    ? profile.getFullName()
                    : (customer.getEmail() != null && !customer.getEmail().isBlank() ? customer.getEmail() : "Customer");

            String phone = profile != null ? profile.getPhoneNumber() : null;
            String photo = profile != null ? profile.getProfileImage() : null;

            return new CustomerSnapshot(name, phone, photo);
        }
    }

    private List<AppointmentResponseDTO.SelectedServiceDTO> parseSelectedServices(Appointment appt) {
        if (appt.getSelectedServicesJson() == null || appt.getSelectedServicesJson().isBlank()) {
            return List.of(AppointmentResponseDTO.SelectedServiceDTO.builder()
                    .serviceCatalogId(appt.getServiceCatalog().getId())
                    .subServiceName(appt.getServiceCatalog().getSubServiceName())
                    .estimatedAmount(appt.getEstimatedAmount())
                    .build());
        }
        try {
            List<Map<String, Object>> rows = objectMapper.readValue(
                    appt.getSelectedServicesJson(), new TypeReference<>() {});
            return rows.stream().map(row -> AppointmentResponseDTO.SelectedServiceDTO.builder()
                    .serviceCatalogId(((Number) row.get("serviceCatalogId")).longValue())
                    .subServiceName(String.valueOf(row.get("subServiceName")))
                    .estimatedAmount(((Number) row.get("estimatedAmount")).intValue())
                    .build()).toList();
        } catch (Exception ignored) {
            return Collections.emptyList();
        }
    }

    private List<AppointmentResponseDTO.CompletedServiceDTO> parseCompletedServices(Appointment appt) {
        if (appt.getCompletedServicesJson() == null || appt.getCompletedServicesJson().isBlank()) {
            return Collections.emptyList();
        }
        try {
            List<Map<String, Object>> rows = objectMapper.readValue(
                    appt.getCompletedServicesJson(), new TypeReference<>() {});
            return rows.stream().map(row -> AppointmentResponseDTO.CompletedServiceDTO.builder()
                    .serviceCatalogId(((Number) row.get("serviceCatalogId")).longValue())
                    .subServiceName(String.valueOf(row.get("subServiceName")))
                    .finalAmount(((Number) row.get("finalAmount")).intValue())
                    .build()).toList();
        } catch (Exception ignored) {
            return Collections.emptyList();
        }
    }
}
