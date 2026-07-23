package com.servicelink.core.mapper.appointment;

import com.servicelink.core.dto.response.appointment.AppointmentResponseDTO;
import com.servicelink.core.dto.response.appointment.AppointmentSummaryDTO;
import com.servicelink.core.model.appointment.Appointment;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.provider.ProviderService;
import com.servicelink.core.model.provider.ServiceCatalog;
import com.servicelink.core.model.user.User;
import com.servicelink.core.model.user.UserProfile;
import org.springframework.stereotype.Component;

@Component
public class AppointmentMapper {

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
                .providerProfilePicture(appt.getProvider().getProfilePictureUrl())
                .subServiceName(appt.getServiceCatalog().getSubServiceName())
                .appointmentDate(appt.getAppointmentDate())
                .timeSlot(appt.getTimeSlot())
                .estimatedStartTime(appt.getEstimatedStartTime())
                .status(appt.getStatus())
                .totalPrice(appt.getTotalPrice())
                .address(appt.getAddress())
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
}