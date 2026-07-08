package com.servicelink.core.service.appointment;

import com.servicelink.core.dto.request.appointment.AppointmentRequestDTO;
import com.servicelink.core.dto.request.appointment.AppointmentStatusUpdateDTO;
import com.servicelink.core.dto.response.appointment.AppointmentResponseDTO;
import com.servicelink.core.dto.response.appointment.AppointmentStatsDTO;
import com.servicelink.core.dto.response.appointment.AppointmentSummaryDTO;
import com.servicelink.core.exception.BusinessException;
import com.servicelink.core.exception.ConflictException;
import com.servicelink.core.exception.ResourceNotFoundException;
import com.servicelink.core.mapper.appointment.AppointmentMapper;
import com.servicelink.core.model.appointment.Appointment;
import com.servicelink.core.model.appointment.AppointmentStatus;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.provider.ProviderService;
import com.servicelink.core.model.provider.ServiceCatalog;
import com.servicelink.core.repository.appointment.AppointmentRepository;
import com.servicelink.core.repository.provider.ProviderRepository;
import com.servicelink.core.repository.appointment.ProviderServiceRepository;
import com.servicelink.core.repository.appointment.ServiceCatalogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepo;
    private final ProviderRepository providerRepo;
    private final ProviderServiceRepository providerServiceRepo;
    private final ServiceCatalogRepository catalogRepo;
    private final AppointmentMapper mapper;
    private final AppointmentPricingService pricingService;

    @Transactional
    public AppointmentResponseDTO book(Long customerId, AppointmentRequestDTO req) {
        Provider provider = providerRepo.findById(req.getProviderId())
                .filter(p -> Boolean.TRUE.equals(p.getIsActive()))
                .filter(p -> Boolean.TRUE.equals(p.getIsVerified()))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Active verified provider not found with id: " + req.getProviderId()));

        ServiceCatalog catalog = catalogRepo.findByIdAndIsActiveTrue(req.getServiceCatalogId())
                .orElseThrow(() -> new ResourceNotFoundException("ServiceCatalog", req.getServiceCatalogId()));

        ProviderService providerService = providerServiceRepo
                .findAvailableByProviderAndCatalog(req.getProviderId(), req.getServiceCatalogId())
                .orElseThrow(() -> new BusinessException(
                        "Provider does not offer this service or it is currently unavailable",
                        "SERVICE_UNAVAILABLE"));

        if (appointmentRepo.isSlotTaken(req.getProviderId(), req.getAppointmentDate(), req.getTimeSlot())) {
            throw new ConflictException(
                    "The " + req.getTimeSlot().getDisplayLabel() + " slot on "
                            + req.getAppointmentDate() + " is already booked for this provider",
                    "APPOINTMENT_SLOT_TAKEN");
        }

        Appointment appointment = Appointment.builder()
                .provider(provider)
                .serviceCatalog(catalog)
                .customerId(customerId)
                .appointmentDate(req.getAppointmentDate())
                .timeSlot(req.getTimeSlot())
                .estimatedStartTime(req.getTimeSlot().getStartTime())
                .estimatedEndTime(req.getTimeSlot().getEndTime())
                .address(req.getAddress())
                .notes(req.getNotes())
                .attachedImgUrl(req.getAttachedImgUrl())
                .attachedVideoUrl(req.getAttachedVideoUrl())
                .attachedAudioUrl(req.getAttachedAudioUrl())
                .areaSqFt(req.getAreaSqFt())
                .wallCount(req.getWallCount())
                .itemCount(req.getItemCount())
                .totalPrice(pricingService.calculateTotalPrice(providerService, req))
                .status(AppointmentStatus.PENDING)
                .build();

        Appointment saved = appointmentRepo.save(appointment);
        log.info("Appointment {} created for customer {} and provider {}", saved.getId(), customerId, provider.getId());

        return mapper.toResponseDTO(saved, providerService);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentSummaryDTO> getMyAppointments(
            Long customerId, AppointmentStatus status, Pageable pageable) {
        Page<Appointment> appointments = status == null
                ? appointmentRepo.findByCustomerIdWithDetails(customerId, pageable)
                : appointmentRepo.findByCustomerIdAndStatusWithDetails(customerId, status, pageable);

        return appointments.map(mapper::toSummaryDTO);
    }

    @Transactional(readOnly = true)
    public AppointmentResponseDTO getMyAppointmentDetail(Long customerId, Long appointmentId) {
        Appointment appointment = appointmentRepo.findByIdAndCustomerId(appointmentId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", appointmentId));

        return mapper.toResponseDTO(appointment, resolveProviderService(appointment));
    }

    @Transactional
    public AppointmentResponseDTO cancelByCustomer(Long customerId, Long appointmentId, String reason) {
        Appointment appointment = appointmentRepo.findByIdAndCustomerId(appointmentId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", appointmentId));

        assertTransition(appointment, AppointmentStatus.CANCELLED);
        applyStatusTransition(appointment, AppointmentStatus.CANCELLED, customerId, reason);

        log.info("Appointment {} cancelled by customer {}", appointmentId, customerId);
        return mapper.toResponseDTO(appointmentRepo.save(appointment), resolveProviderService(appointment));
    }

    @Transactional(readOnly = true)
    public Page<AppointmentSummaryDTO> getProviderAppointments(
            Long providerUserId, AppointmentStatus status, Pageable pageable) {
        Long providerId = resolveProviderIdForUser(providerUserId);
        Page<Appointment> appointments = status == null
                ? appointmentRepo.findByProviderIdWithDetails(providerId, pageable)
                : appointmentRepo.findByProviderIdAndStatusWithDetails(providerId, status, pageable);

        return appointments.map(mapper::toSummaryDTO);
    }

    @Transactional(readOnly = true)
    public AppointmentResponseDTO getProviderAppointmentDetail(Long providerUserId, Long appointmentId) {
        Long providerId = resolveProviderIdForUser(providerUserId);
        Appointment appointment = appointmentRepo.findByIdAndProviderId(appointmentId, providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", appointmentId));

        return mapper.toResponseDTO(appointment, resolveProviderService(appointment));
    }

    @Transactional(readOnly = true)
    public List<AppointmentSummaryDTO> getProviderUpcomingJobs(Long providerUserId) {
        Long providerId = resolveProviderIdForUser(providerUserId);

        return appointmentRepo.findUpcomingByProvider(providerId, LocalDate.now()).stream()
                .map(mapper::toSummaryDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentSummaryDTO> getProviderDayView(Long providerUserId, LocalDate date) {
        Long providerId = resolveProviderIdForUser(providerUserId);

        return appointmentRepo.findByProviderAndDate(providerId, date).stream()
                .map(mapper::toSummaryDTO)
                .toList();
    }

    @Transactional
    public AppointmentResponseDTO updateStatusByProvider(
            Long providerUserId, Long appointmentId, AppointmentStatusUpdateDTO req) {
        Long providerId = resolveProviderIdForUser(providerUserId);
        Appointment appointment = appointmentRepo.findByIdAndProviderId(appointmentId, providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", appointmentId));

        assertTransition(appointment, req.getStatus());
        applyStatusTransition(appointment, req.getStatus(), providerId, req.getReason());

        log.info("Appointment {} changed to {} by provider {}", appointmentId, req.getStatus(), providerId);
        return mapper.toResponseDTO(appointmentRepo.save(appointment), resolveProviderService(appointment));
    }

    @Transactional(readOnly = true)
    public AppointmentStatsDTO getCustomerStats(Long customerId) {
        return AppointmentStatsDTO.builder()
                .total(appointmentRepo.countByCustomerId(customerId))
                .pending(appointmentRepo.countByCustomerIdAndStatus(customerId, AppointmentStatus.PENDING))
                .confirmed(appointmentRepo.countByCustomerIdAndStatus(customerId, AppointmentStatus.CONFIRMED))
                .inProgress(appointmentRepo.countByCustomerIdAndStatus(customerId, AppointmentStatus.IN_PROGRESS))
                .completed(appointmentRepo.countByCustomerIdAndStatus(customerId, AppointmentStatus.COMPLETED))
                .cancelled(appointmentRepo.countByCustomerIdAndStatus(customerId, AppointmentStatus.CANCELLED))
                .build();
    }

    @Transactional(readOnly = true)
    public AppointmentStatsDTO getProviderStats(Long providerUserId) {
        Long providerId = resolveProviderIdForUser(providerUserId);

        return AppointmentStatsDTO.builder()
                .total(appointmentRepo.countByProvider_Id(providerId))
                .pending(appointmentRepo.countByProvider_IdAndStatus(providerId, AppointmentStatus.PENDING))
                .confirmed(appointmentRepo.countByProvider_IdAndStatus(providerId, AppointmentStatus.CONFIRMED))
                .inProgress(appointmentRepo.countByProvider_IdAndStatus(providerId, AppointmentStatus.IN_PROGRESS))
                .completed(appointmentRepo.countByProvider_IdAndStatus(providerId, AppointmentStatus.COMPLETED))
                .cancelled(appointmentRepo.countByProvider_IdAndStatus(providerId, AppointmentStatus.CANCELLED))
                .build();
    }

    private void assertTransition(Appointment appointment, AppointmentStatus next) {
        if (!appointment.canTransitionTo(next)) {
            throw new BusinessException(
                    "Cannot transition appointment from [" + appointment.getStatus() + "] to [" + next + "]",
                    "INVALID_STATUS_TRANSITION");
        }
    }

    private void applyStatusTransition(
            Appointment appointment, AppointmentStatus next, Long actorId, String reason) {
        appointment.setStatus(next);

        switch (next) {
            case CONFIRMED -> appointment.setConfirmedAt(LocalDateTime.now());
            case IN_PROGRESS -> appointment.setStartedAt(LocalDateTime.now());
            case COMPLETED -> {
                appointment.setCompletedAt(LocalDateTime.now());
                incrementProviderJobCount(appointment.getProvider());
            }
            case CANCELLED -> {
                appointment.setCancelledAt(LocalDateTime.now());
                appointment.setCancelledBy(actorId);
                appointment.setCancellationReason(reason);
            }
            default -> {
            }
        }
    }

    private void incrementProviderJobCount(Provider provider) {
        if (provider != null) {
            provider.setTotalJobs(provider.getTotalJobs() == null ? 1 : provider.getTotalJobs() + 1);
        }
    }

    private ProviderService resolveProviderService(Appointment appointment) {
        return providerServiceRepo
                .findAvailableByProviderAndCatalog(
                        appointment.getProvider().getId(),
                        appointment.getServiceCatalog().getId())
                .orElse(null);
    }

    private Long resolveProviderIdForUser(Long userId) {
        return providerRepo.findByUser_Id(userId)
                .filter(provider -> Boolean.TRUE.equals(provider.getIsActive()))
                .map(Provider::getId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Active provider profile not found for user id: " + userId));
    }
}
