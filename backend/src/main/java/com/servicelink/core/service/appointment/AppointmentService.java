package com.servicelink.core.service.appointment;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import com.servicelink.core.model.appointment.AppointmentPaymentStatus;
import com.servicelink.core.model.notification.NotificationCategory;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.provider.ProviderService;
import com.servicelink.core.model.provider.ServiceCatalog;
import com.servicelink.core.model.user.Role;
import com.servicelink.core.model.user.User;
import com.servicelink.core.repository.UserRepository;
import com.servicelink.core.repository.appointment.AppointmentRepository;
import com.servicelink.core.repository.provider.ProviderRepository;
import com.servicelink.core.repository.appointment.ProviderServiceRepository;
import com.servicelink.core.repository.appointment.ServiceCatalogRepository;
import com.servicelink.core.service.notification.NotificationService;
import com.servicelink.core.repository.business.job.JobAssignmentRepository;
import com.servicelink.core.model.business.job.JobAssignmentStatus;
import com.servicelink.core.model.business.job.ProJobStatus;
import com.servicelink.core.model.business.job.ProJobTicket;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.LinkedHashMap;

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
    private final UserRepository userRepo;
    private final NotificationService notificationService;
    private final JobAssignmentRepository jobAssignmentRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ─────────────────────────────────────────────────────────────────────────
    // CUSTOMER-FACING
    // ─────────────────────────────────────────────────────────────────────────

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

        // Check overlap with Pro jobs
        boolean hasProJobOverlap = jobAssignmentRepository.findByProviderId(req.getProviderId()).stream()
                .filter(a -> a.getStatus() == JobAssignmentStatus.ACCEPTED)
                .anyMatch(a -> {
                    ProJobTicket jt = a.getJobTicket();
                    if (jt.getStatus() == ProJobStatus.CANCELLED || jt.getStatus() == ProJobStatus.UNFULFILLED) return false;
                    boolean dateOverlap = !req.getAppointmentDate().isBefore(jt.getStartDate()) 
                            && !req.getAppointmentDate().isAfter(jt.getEndDate() != null ? jt.getEndDate() : jt.getStartDate());
                    if (!dateOverlap) return false;
                    java.time.LocalTime slotStart = req.getTimeSlot().getStartTime();
                    java.time.LocalTime slotEnd = req.getTimeSlot().getEndTime();
                    return slotStart.isBefore(jt.getEndTime()) && slotEnd.isAfter(jt.getStartTime());
                });
        if (hasProJobOverlap) {
            throw new ConflictException("The provider is booked for a ServiceLink Pro job during this time slot.", "PRO_JOB_CONFLICT");
        }

        List<AppointmentRequestDTO.ServiceSelectionDTO> selections = req.getSelectedServices();
        if (selections == null || selections.isEmpty()) {
            AppointmentRequestDTO.ServiceSelectionDTO selection = new AppointmentRequestDTO.ServiceSelectionDTO();
            selection.setServiceCatalogId(req.getServiceCatalogId());
            selection.setAreaSqFt(req.getAreaSqFt());
            selection.setWallCount(req.getWallCount());
            selection.setItemCount(req.getItemCount());
            selection.setHours(req.getHours());
            selections = List.of(selection);
        }

        List<Map<String, Object>> selectedServiceSnapshot = new ArrayList<>();
        int calculatedPrice = 0;
        for (AppointmentRequestDTO.ServiceSelectionDTO selection : selections) {
            ServiceCatalog selectedCatalog = catalogRepo.findByIdAndIsActiveTrue(selection.getServiceCatalogId())
                    .orElseThrow(() -> new ResourceNotFoundException("ServiceCatalog", selection.getServiceCatalogId()));
            ProviderService selectedProviderService = providerServiceRepo
                    .findAvailableByProviderAndCatalog(req.getProviderId(), selection.getServiceCatalogId())
                    .orElseThrow(() -> new BusinessException(
                            "Provider does not offer selected service: " + selectedCatalog.getSubServiceName(),
                            "SERVICE_UNAVAILABLE"));
            AppointmentRequestDTO priceRequest = requestForSelection(req, selection);
            int serviceEstimate = pricingService.calculateTotalPrice(selectedProviderService, priceRequest);
            calculatedPrice += serviceEstimate;

            Map<String, Object> snapshot = new LinkedHashMap<>();
            snapshot.put("serviceCatalogId", selectedCatalog.getId());
            snapshot.put("subServiceName", selectedCatalog.getSubServiceName());
            snapshot.put("estimatedAmount", serviceEstimate);
            selectedServiceSnapshot.add(snapshot);
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
                .hours(req.getHours())
                .providerRate(providerService.getCustomPrice())
                .pricingUnit(catalog.getPricingUnit())
                .estimatedAmount(calculatedPrice)
                .totalPrice(calculatedPrice)
                .selectedServicesJson(writeSelectedServices(selectedServiceSnapshot))
                .status(AppointmentStatus.PENDING)
                .build();

        Appointment saved = appointmentRepo.save(appointment);
        log.info("Appointment {} created for customer {} and provider {}", saved.getId(), customerId, provider.getId());

        // 🔔 NOTIFY PROVIDER: new booking request
        notificationService.sendPrivateNotification(
                provider.getUser().getId(),          // provider's User id (assuming Provider -> User relation)
                Role.PROVIDER,
                NotificationCategory.BOOKING,
                "New Appointment Request",
                "New booking request: " + catalog.getCategory().getName() + " – " + catalog.getSubServiceName()
                        + " on " + req.getAppointmentDate(),
                "/dashboard/provider/appointments/" + saved.getId()
        );

        User customer = userRepo.findById(customerId).orElse(null);
        return mapper.toResponseDTO(saved, providerService, customer);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentSummaryDTO> getMyAppointments(
            Long customerId, AppointmentStatus status, Pageable pageable) {
        Page<Appointment> appointments = status == null
                ? appointmentRepo.findByCustomerIdWithDetails(customerId, pageable)
                : appointmentRepo.findByCustomerIdAndStatusWithDetails(customerId, status, pageable);

        User customer = userRepo.findById(customerId).orElse(null);
        return appointments.map(a -> mapper.toSummaryDTO(a, customer));
    }

    @Transactional(readOnly = true)
    public AppointmentResponseDTO getMyAppointmentDetail(Long customerId, Long appointmentId) {
        Appointment appointment = appointmentRepo.findByIdAndCustomerId(appointmentId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", appointmentId));

        User customer = userRepo.findById(customerId).orElse(null);
        return mapper.toResponseDTO(appointment, resolveProviderService(appointment), customer);
    }

    @Transactional
    public AppointmentResponseDTO cancelByCustomer(Long customerId, Long appointmentId, String reason) {
        Appointment appointment = appointmentRepo.findByIdAndCustomerId(appointmentId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", appointmentId));

        assertTransition(appointment, AppointmentStatus.CANCELLED);
        applyStatusTransition(appointment, AppointmentStatus.CANCELLED, customerId, reason);

        log.info("Appointment {} cancelled by customer {}", appointmentId, customerId);

        User customer = userRepo.findById(customerId).orElse(null);
        return mapper.toResponseDTO(appointmentRepo.save(appointment), resolveProviderService(appointment), customer);
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

    // ─────────────────────────────────────────────────────────────────────────
    // PROVIDER-FACING
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<AppointmentSummaryDTO> getProviderAppointments(
            Long providerUserId, AppointmentStatus status, Pageable pageable) {
        Long providerId = resolveProviderIdForUser(providerUserId);
        Page<Appointment> appointments = status == null
                ? appointmentRepo.findByProviderIdWithDetails(providerId, pageable)
                : appointmentRepo.findByProviderIdAndStatusWithDetails(providerId, status, pageable);

        Map<Long, User> customerMap = batchLoadCustomers(appointments.getContent());
        return appointments.map(a -> mapper.toSummaryDTO(a, customerMap.get(a.getCustomerId())));
    }

    @Transactional(readOnly = true)
    public AppointmentResponseDTO getProviderAppointmentDetail(Long providerUserId, Long appointmentId) {
        Long providerId = resolveProviderIdForUser(providerUserId);
        Appointment appointment = appointmentRepo.findByIdAndProviderId(appointmentId, providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", appointmentId));

        User customer = userRepo.findById(appointment.getCustomerId()).orElse(null);
        return mapper.toResponseDTO(appointment, resolveProviderService(appointment), customer);
    }

    @Transactional(readOnly = true)
    public List<AppointmentSummaryDTO> getProviderUpcomingJobs(Long providerUserId) {
        Long providerId = resolveProviderIdForUser(providerUserId);
        List<Appointment> appointments = appointmentRepo.findUpcomingByProvider(providerId, LocalDate.now());

        Map<Long, User> customerMap = batchLoadCustomers(appointments);
        return appointments.stream()
                .map(a -> mapper.toSummaryDTO(a, customerMap.get(a.getCustomerId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentSummaryDTO> getProviderDayView(Long providerUserId, LocalDate date) {
        Long providerId = resolveProviderIdForUser(providerUserId);
        List<Appointment> appointments = appointmentRepo.findByProviderAndDate(providerId, date);

        Map<Long, User> customerMap = batchLoadCustomers(appointments);
        return appointments.stream()
                .map(a -> mapper.toSummaryDTO(a, customerMap.get(a.getCustomerId())))
                .toList();
    }

    @Transactional
    public AppointmentResponseDTO updateStatusByProvider(
            Long providerUserId, Long appointmentId, AppointmentStatusUpdateDTO req) {
        Long providerId = resolveProviderIdForUser(providerUserId);
        Appointment appointment = appointmentRepo.findByIdAndProviderId(appointmentId, providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", appointmentId));

        assertTransitionAndOperational(appointment, req.getStatus(), req.getOperationalStatus());
        applyStatusTransition(appointment, req, providerId);

        log.info("Appointment {} changed to {} by provider {}", appointmentId, req.getStatus(), providerId);

        User customer = userRepo.findById(appointment.getCustomerId()).orElse(null);
        return mapper.toResponseDTO(appointmentRepo.save(appointment), resolveProviderService(appointment), customer);
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

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    /** Batch-loads all distinct customers for a list of appointments in a single query (avoids N+1). */
    private Map<Long, User> batchLoadCustomers(List<Appointment> appointments) {
        List<Long> customerIds = appointments.stream()
                .map(Appointment::getCustomerId)
                .distinct()
                .toList();
        return userRepo.findAllById(customerIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
    }

    private void assertTransition(Appointment appointment, AppointmentStatus nextStatus) {
        assertTransitionAndOperational(appointment, nextStatus, null);
    }

    private void applyStatusTransition(Appointment appointment, AppointmentStatus nextStatus, Long actorId, String reason) {
        AppointmentStatusUpdateDTO req = new AppointmentStatusUpdateDTO();
        req.setStatus(nextStatus);
        req.setReason(reason);
        applyStatusTransition(appointment, req, actorId);
    }

    private void assertTransitionAndOperational(Appointment appointment, AppointmentStatus nextStatus, String nextOpStatus) {
        if (appointment.getStatus() != nextStatus && !appointment.canTransitionTo(nextStatus)) {
            throw new BusinessException(
                    "Cannot transition appointment from [" + appointment.getStatus() + "] to [" + nextStatus + "]",
                    "INVALID_STATUS_TRANSITION");
        }

        AppointmentStatus currentStatus = appointment.getStatus();
        String currentOpStatus = appointment.getOperationalStatus() != null ? appointment.getOperationalStatus() : "CONFIRMED";

        if (nextStatus == AppointmentStatus.CANCELLED) {
            if (currentStatus == AppointmentStatus.COMPLETED || currentStatus == AppointmentStatus.CANCELLED) {
                throw new BusinessException("Cannot cancel a completed or cancelled job", "INVALID_STATUS_TRANSITION");
            }
            return;
        }

        if (currentStatus == AppointmentStatus.PENDING) {
            if (nextStatus != AppointmentStatus.CONFIRMED) {
                throw new BusinessException("Pending appointment can only transition to CONFIRMED", "INVALID_STATUS_TRANSITION");
            }
            return;
        }

        if (currentStatus == AppointmentStatus.CONFIRMED) {
            if (nextStatus != AppointmentStatus.IN_PROGRESS) {
                throw new BusinessException("Invalid status transition from CONFIRMED to " + nextStatus, "INVALID_STATUS_TRANSITION");
            }
            return;
        }

        if (currentStatus == AppointmentStatus.IN_PROGRESS) {
            if (nextStatus != AppointmentStatus.COMPLETED) {
                throw new BusinessException("Work in progress can only transition to COMPLETED", "INVALID_STATUS_TRANSITION");
            }
            return;
        }
    }

    private void applyStatusTransition(
            Appointment appointment, AppointmentStatusUpdateDTO req, Long actorId) {
        AppointmentStatus next = req.getStatus();
        appointment.setStatus(next);

        if (req.getOperationalStatus() != null) {
            appointment.setOperationalStatus(req.getOperationalStatus());
        } else {
            if (next == AppointmentStatus.CONFIRMED) {
                appointment.setOperationalStatus("CONFIRMED");
            } else if (next == AppointmentStatus.IN_PROGRESS) {
                appointment.setOperationalStatus("IN_PROGRESS");
            } else if (next == AppointmentStatus.COMPLETED) {
                appointment.setOperationalStatus("COMPLETED");
            } else if (next == AppointmentStatus.CANCELLED) {
                appointment.setOperationalStatus("CANCELLED");
            }
        }

        switch (next) {
            case CONFIRMED -> {
                appointment.setConfirmedAt(LocalDateTime.now());

                // 🔔 NOTIFY CUSTOMER: appointment accepted
                notificationService.sendPrivateNotification(
                        appointment.getCustomerId(),
                        Role.CUSTOMER,
                        NotificationCategory.BOOKING,
                        "Appointment Confirmed!",
                        "Your appointment on " + appointment.getAppointmentDate()
                                + " has been accepted by the provider.",
                        "/dashboard/user/bookings"
                );
            }
            case IN_PROGRESS -> {
                appointment.setStartedAt(LocalDateTime.now());
                notificationService.sendPrivateNotification(
                        appointment.getCustomerId(),
                        Role.CUSTOMER,
                        NotificationCategory.BOOKING,
                        "Service Started",
                        "Your service has started.",
                        "/dashboard/user/bookings"
                );
            }
            case COMPLETED -> {
                if (req.getCompletedServices() != null && !req.getCompletedServices().isEmpty()) {
                    List<Long> bookedServiceIds = selectedServiceIds(appointment);
                    List<Long> completedServiceIds = req.getCompletedServices().stream()
                            .map(AppointmentStatusUpdateDTO.ServiceCompletionDTO::getServiceCatalogId)
                            .distinct()
                            .toList();
                    if (completedServiceIds.size() != req.getCompletedServices().size()
                            || !bookedServiceIds.equals(completedServiceIds)) {
                        throw new BusinessException(
                                "Final amounts must be provided once for every booked service",
                                "SERVICE_COMPLETION_MISMATCH");
                    }
                    int serviceTotal = req.getCompletedServices().stream()
                            .mapToInt(AppointmentStatusUpdateDTO.ServiceCompletionDTO::getFinalAmount)
                            .sum();
                    req.setFinalAmount(serviceTotal);
                    appointment.setCompletedServicesJson(writeCompletedServices(req.getCompletedServices()));
                }
                if (req.getFinalAmount() == null) {
                    throw new BusinessException("Final amount is required to complete the service", "FINAL_AMOUNT_REQUIRED");
                }
                if (req.getPaymentStatus() == null) {
                    throw new BusinessException("Payment status is required to complete the service", "PAYMENT_STATUS_REQUIRED");
                }
                if (req.getPaymentStatus() == AppointmentPaymentStatus.PAID && req.getPaymentMethod() == null) {
                    throw new BusinessException("Payment method is required when payment is received", "PAYMENT_METHOD_REQUIRED");
                }
                appointment.setCompletedAt(LocalDateTime.now());
                appointment.setFinalAmount(req.getFinalAmount());
                appointment.setPaymentStatus(req.getPaymentStatus());
                appointment.setPaymentMethod(req.getPaymentStatus() == AppointmentPaymentStatus.PAID ? req.getPaymentMethod() : null);
                appointment.setCompletionNote(req.getCompletionNote());
                if (req.getMeasuredQuantity() != null && appointment.getPricingUnit() != null) {
                    int qty = req.getMeasuredQuantity();
                    switch (appointment.getPricingUnit()) {
                        case PER_SQFT -> appointment.setAreaSqFt(qty);
                        case PER_WALL -> appointment.setWallCount(qty);
                        case PER_ITEM -> appointment.setItemCount(qty);
                        case PER_HOUR -> appointment.setHours(qty);
                        default -> {}
                    }
                }
                incrementProviderJobCount(appointment.getProvider());

                // Optional but often expected: notify customer job is done
                notificationService.sendPrivateNotification(
                        appointment.getCustomerId(),
                        Role.CUSTOMER,
                        NotificationCategory.BOOKING,
                        "Service Completed",
                        "Your appointment has been marked as completed.",
                        "/dashboard/user/bookings"
                );
            }
            case CANCELLED -> {
                appointment.setCancelledAt(LocalDateTime.now());
                appointment.setCancelledBy(actorId);
                appointment.setCancellationReason(req.getReason());
            }
            default -> {
            }
        }
    }

    @Transactional
    public AppointmentResponseDTO updateAppointment(Long customerId, Long appointmentId, AppointmentRequestDTO req) {
        Appointment appointment = appointmentRepo.findByIdAndCustomerId(appointmentId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", appointmentId));

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new BusinessException("Only pending appointments can be updated", "EDIT_NOT_ELIGIBLE");
        }

        if (appointmentRepo.isSlotTakenExcluding(req.getProviderId(), req.getAppointmentDate(), req.getTimeSlot(), appointmentId)) {
            throw new ConflictException(
                    "The " + req.getTimeSlot().getDisplayLabel() + " slot on "
                            + req.getAppointmentDate() + " is already booked for this provider",
                    "APPOINTMENT_SLOT_TAKEN");
        }

        Provider provider = providerRepo.findById(req.getProviderId())
                .filter(p -> Boolean.TRUE.equals(p.getIsActive()))
                .filter(p -> Boolean.TRUE.equals(p.getIsVerified()))
                .orElseThrow(() -> new ResourceNotFoundException("Provider", req.getProviderId()));

        ServiceCatalog catalog = catalogRepo.findByIdAndIsActiveTrue(req.getServiceCatalogId())
                .orElseThrow(() -> new ResourceNotFoundException("ServiceCatalog", req.getServiceCatalogId()));

        ProviderService providerService = providerServiceRepo
                .findAvailableByProviderAndCatalog(req.getProviderId(), req.getServiceCatalogId())
                .orElseThrow(() -> new BusinessException("Provider does not offer this service", "SERVICE_UNAVAILABLE"));

        appointment.setProvider(provider);
        appointment.setServiceCatalog(catalog);
        appointment.setAppointmentDate(req.getAppointmentDate());
        appointment.setTimeSlot(req.getTimeSlot());
        appointment.setEstimatedStartTime(req.getTimeSlot().getStartTime());
        appointment.setEstimatedEndTime(req.getTimeSlot().getEndTime());
        appointment.setAddress(req.getAddress());
        appointment.setNotes(req.getNotes());
        appointment.setAttachedImgUrl(req.getAttachedImgUrl());
        appointment.setAttachedVideoUrl(req.getAttachedVideoUrl());
        appointment.setAttachedAudioUrl(req.getAttachedAudioUrl());
        appointment.setAreaSqFt(req.getAreaSqFt());
        appointment.setWallCount(req.getWallCount());
        appointment.setItemCount(req.getItemCount());
        appointment.setHours(req.getHours());
        appointment.setProviderRate(providerService.getCustomPrice());
        appointment.setPricingUnit(catalog.getPricingUnit());

        int calculatedPrice = 0;
        List<Map<String, Object>> selectedServiceSnapshot = new ArrayList<>();
        List<AppointmentRequestDTO.ServiceSelectionDTO> selections = req.getSelectedServices();
        if (selections == null || selections.isEmpty()) {
            AppointmentRequestDTO.ServiceSelectionDTO selection = new AppointmentRequestDTO.ServiceSelectionDTO();
            selection.setServiceCatalogId(req.getServiceCatalogId());
            selection.setAreaSqFt(req.getAreaSqFt());
            selection.setWallCount(req.getWallCount());
            selection.setItemCount(req.getItemCount());
            selection.setHours(req.getHours());
            selections = List.of(selection);
        }
        for (AppointmentRequestDTO.ServiceSelectionDTO selection : selections) {
            ServiceCatalog selectedCatalog = catalogRepo.findByIdAndIsActiveTrue(selection.getServiceCatalogId())
                    .orElseThrow(() -> new ResourceNotFoundException("ServiceCatalog", selection.getServiceCatalogId()));
            ProviderService selectedProviderService = providerServiceRepo
                    .findAvailableByProviderAndCatalog(req.getProviderId(), selection.getServiceCatalogId())
                    .orElseThrow(() -> new BusinessException("Provider does not offer selected service", "SERVICE_UNAVAILABLE"));
            int serviceEstimate = pricingService.calculateTotalPrice(
                    selectedProviderService, requestForSelection(req, selection));
            calculatedPrice += serviceEstimate;
            Map<String, Object> snapshot = new LinkedHashMap<>();
            snapshot.put("serviceCatalogId", selectedCatalog.getId());
            snapshot.put("subServiceName", selectedCatalog.getSubServiceName());
            snapshot.put("estimatedAmount", serviceEstimate);
            selectedServiceSnapshot.add(snapshot);
        }
        appointment.setEstimatedAmount(calculatedPrice);
        appointment.setTotalPrice(calculatedPrice);
        appointment.setSelectedServicesJson(writeSelectedServices(selectedServiceSnapshot));

        Appointment saved = appointmentRepo.save(appointment);
        User customer = userRepo.findById(customerId).orElse(null);
        return mapper.toResponseDTO(saved, providerService, customer);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getFinalAmount(Long appointmentId) {
        Appointment appointment = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", appointmentId));

        Integer finalAmt = appointment.getFinalAmount();
        if (finalAmt == null) {
            finalAmt = appointment.getTotalPrice();
        }

        Integer qty = null;
        if (appointment.getPricingUnit() != null) {
            qty = switch (appointment.getPricingUnit()) {
                case PER_SQFT -> appointment.getAreaSqFt();
                case PER_WALL -> appointment.getWallCount();
                case PER_ITEM -> appointment.getItemCount();
                case PER_HOUR -> appointment.getHours();
                default -> null;
            };
        }

        return Map.of(
            "appointmentId", appointment.getId(),
            "estimatedAmount", appointment.getEstimatedAmount() != null ? appointment.getEstimatedAmount() : 0,
            "finalAmount", finalAmt != null ? finalAmt : 0,
            "measuredQuantity", qty != null ? qty : 0,
            "confirmedAt", appointment.getCompletedAt() != null ? appointment.getCompletedAt().toString() : LocalDateTime.now().toString()
        );
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

    private AppointmentRequestDTO requestForSelection(
            AppointmentRequestDTO original,
            AppointmentRequestDTO.ServiceSelectionDTO selection) {
        AppointmentRequestDTO request = new AppointmentRequestDTO();
        request.setAreaSqFt(selection.getAreaSqFt());
        request.setWallCount(selection.getWallCount());
        request.setItemCount(selection.getItemCount());
        request.setHours(selection.getHours());
        return request;
    }

    private String writeSelectedServices(List<Map<String, Object>> services) {
        try {
            return objectMapper.writeValueAsString(services);
        } catch (JsonProcessingException exception) {
            throw new BusinessException("Could not save selected services", "SELECTED_SERVICES_INVALID");
        }
    }

    private List<Long> selectedServiceIds(Appointment appointment) {
        if (appointment.getSelectedServicesJson() == null || appointment.getSelectedServicesJson().isBlank()) {
            return List.of(appointment.getServiceCatalog().getId());
        }
        try {
            List<Map<String, Object>> rows = objectMapper.readValue(
                    appointment.getSelectedServicesJson(), new TypeReference<>() {});
            return rows.stream()
                    .map(row -> ((Number) row.get("serviceCatalogId")).longValue())
                    .toList();
        } catch (JsonProcessingException exception) {
            throw new BusinessException("Booked service data is invalid", "SELECTED_SERVICES_INVALID");
        }
    }

    private String writeCompletedServices(List<AppointmentStatusUpdateDTO.ServiceCompletionDTO> services) {
        try {
            return objectMapper.writeValueAsString(services);
        } catch (JsonProcessingException exception) {
            throw new BusinessException("Could not save service completion amounts", "SERVICE_COMPLETION_INVALID");
        }
    }
}
