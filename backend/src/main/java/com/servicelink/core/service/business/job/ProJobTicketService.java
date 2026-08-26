package com.servicelink.core.service.business.job;

import com.servicelink.core.dto.request.business.job.CreateProJobTicketRequest;
import com.servicelink.core.dto.response.business.job.*;
import com.servicelink.core.exception.BusinessException;
import com.servicelink.core.exception.ResourceNotFoundException;
import com.servicelink.core.model.appointment.Appointment;
import com.servicelink.core.model.business.job.*;
import com.servicelink.core.model.common.TimeSlot;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.business.providerpool.ProviderPoolEntry;
import com.servicelink.core.model.business.providerpool.ProviderPoolStatus;
import com.servicelink.core.model.user.User;
import com.servicelink.core.repository.appointment.AppointmentRepository;
import com.servicelink.core.repository.appointment.ServiceCatalogRepository;
import com.servicelink.core.repository.business.ProviderPoolEntryRepository;
import com.servicelink.core.repository.business.job.*;
import com.servicelink.core.repository.provider.ProviderRepository;
import com.servicelink.core.service.business.pool.ProviderPoolService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProJobTicketService {

    private final ProJobTicketRepository jobRepository;
    private final ServiceCatalogRepository catalogRepository;
    private final JobAssignmentRepository assignmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final ProJobSLARepository slaRepository;
    private final ProJobBillingRepository billingRepository;
    private final ProAuditLogRepository auditLogRepository;
    private final ProviderRepository providerRepository;
    private final ProviderPoolEntryRepository poolEntryRepository;
    private final ProviderPoolService providerPoolService;
    private final AppointmentRepository appointmentRepository;

    @Transactional
    public ProJobTicketResponse create(Long organizationId, User actor, CreateProJobTicketRequest request) {
        if (!request.endTime().isAfter(request.startTime())) {
            throw new BusinessException("End time must be after start time", "INVALID_JOB_SCHEDULE");
        }
        var catalog = catalogRepository.findByIdAndIsActiveTrue(request.serviceCatalogId())
                .orElseThrow(() -> new ResourceNotFoundException("Active service catalog", request.serviceCatalogId()));

        var job = ProJobTicket.builder()
                .organizationId(organizationId)
                .createdByUserId(actor.getId())
                .serviceCatalog(catalog)
                .title(request.title())
                .workersRequired(request.workersRequired())
                .scheduledDate(request.scheduledDate())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .location(request.location())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .instructions(request.instructions())
                .pricingModel(request.pricingModel())
                .businessPrice(request.businessPrice())
                .providerEarning(request.providerEarning())
                .status(ProJobStatus.REQUESTED)
                .build();

        ProJobTicket saved = jobRepository.save(job);

        // Pre-create a draft billing record
        ProJobBilling billing = ProJobBilling.builder()
                .jobTicket(saved)
                .estimatedAmount(request.businessPrice())
                .finalAmount(request.businessPrice())
                .paymentStatus(ProPaymentStatus.PENDING)
                .organizationId(organizationId)
                .build();
        billingRepository.save(billing);

        writeAudit(organizationId, saved.getId(), actor, "JOB_CREATED", "Job ticket requested and initialized.");

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<ProJobTicketResponse> list(Long organizationId, ProJobStatus status, Pageable pageable) {
        Page<ProJobTicket> jobs = (status == null)
                ? jobRepository.findByOrganizationIdOrderByScheduledDateDescStartTimeDesc(organizationId, pageable)
                : jobRepository.findByOrganizationIdAndStatusOrderByScheduledDateDescStartTimeDesc(organizationId, status, pageable);
        return jobs.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ProJobDetailResponse getDetails(Long organizationId, Long jobId) {
        ProJobTicket job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job Ticket", jobId));
        if (!job.getOrganizationId().equals(organizationId)) {
            throw new BusinessException("Unauthorized job ticket access", "UNAUTHORIZED");
        }

        List<JobAssignment> assignments = assignmentRepository.findByJobTicketId(jobId);
        ProJobBilling billing = billingRepository.findByJobTicketId(jobId).orElse(null);
        List<Attendance> attendance = attendanceRepository.findByJobTicketId(jobId);
        List<ProJobSLA> sla = slaRepository.findByJobTicketId(jobId);

        var assignList = assignments.stream()
                .map(a -> new ProJobDetailResponse.AssignedProviderInfo(
                        a.getProvider().getId(),
                        a.getProvider().getFullName(),
                        a.getProvider().getBusinessName(),
                        a.getProvider().getProfilePictureUrl()
                )).toList();

        var attendList = attendance.stream()
                .map(a -> new ProJobDetailResponse.AttendanceInfo(
                        a.getId(),
                        a.getProvider().getId(),
                        a.getProvider().getFullName(),
                        a.getCheckInTime(),
                        a.getCheckOutTime(),
                        a.getStatus().name(),
                        a.getLatitude(),
                        a.getLongitude(),
                        a.getDistanceFromJob(),
                        a.getLocationVerified(),
                        a.getRejectionReason()
                )).toList();

        var slaList = sla.stream()
                .map(s -> new ProJobDetailResponse.SlaInfo(
                        s.getId(),
                        s.getProvider().getId(),
                        s.getProvider().getFullName(),
                        s.getExpectedArrival(),
                        s.getActualArrival(),
                        s.getArrivalDifferenceMinutes(),
                        s.getComplianceStatus().name()
                )).toList();

        ProJobDetailResponse.ProJobBillingInfo billingInfo = null;
        if (billing != null) {
            billingInfo = new ProJobDetailResponse.ProJobBillingInfo(
                    billing.getId(),
                    billing.getEstimatedAmount(),
                    billing.getFinalAmount(),
                    billing.getPaymentStatus().name(),
                    billing.getTransactionId(),
                    billing.getPaymentMethod(),
                    billing.getPaymentDate(),
                    billing.getInvoiceNumber()
            );
        }

        var service = job.getServiceCatalog();
        return new ProJobDetailResponse(
                job.getId(),
                "JT-" + job.getId(),
                job.getTitle(),
                service.getId(),
                service.getCategory().getName(),
                service.getSubServiceName(),
                job.getWorkersRequired(),
                job.getScheduledDate(),
                job.getStartTime(),
                job.getEndTime(),
                job.getLocation(),
                job.getLatitude(),
                job.getLongitude(),
                job.getInstructions(),
                job.getPricingModel(),
                job.getBusinessPrice(),
                job.getProviderEarning(),
                job.getStatus(),
                job.getCreatedAt(),
                assignList,
                billingInfo,
                attendList,
                slaList
        );
    }

    @Transactional(readOnly = true)
    public List<ProEligibleProviderResponse> getEligibleProviders(Long organizationId, Long jobId) {
        ProJobTicket job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job Ticket", jobId));

        // Get pool entries for this organization
        List<ProviderPoolEntry> poolEntries = poolEntryRepository.findAllByOrganizationIdAndStatus(organizationId, ProviderPoolStatus.ACTIVE);

        return poolEntries.stream()
                .map(entry -> {
                    Provider provider = entry.getProvider();
                    boolean skillMatches = provider.getPrimaryCategoryName() != null 
                            && provider.getPrimaryCategoryName().equalsIgnoreCase(job.getServiceCatalog().getCategory().getName());
                    if (!skillMatches) return null;

                    boolean proEligible = providerPoolService.computeProOrdersEligible(provider);
                    if (!proEligible) return null;

                    // Check for conflicts
                    boolean hasConflict = checkProviderHasConflict(provider.getId(), job.getScheduledDate(), job.getStartTime(), job.getEndTime());

                    return new ProEligibleProviderResponse(
                            provider.getId(),
                            provider.getFullName(),
                            provider.getBusinessName(),
                            provider.getPrimaryCategoryName(),
                            provider.getAverageRating(),
                            provider.getProfilePictureUrl(),
                            !hasConflict,
                            provider.getBaseDistrict() != null ? provider.getBaseDistrict() : provider.getServiceAreaText()
                    );
                })
                .filter(Objects::nonNull)
                .toList();
    }

    @Transactional
    public void assignProvider(Long organizationId, Long jobId, Long providerId, User actor) {
        ProJobTicket job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job Ticket", jobId));
        if (!job.getOrganizationId().equals(organizationId)) {
            throw new BusinessException("Unauthorized assignment action", "UNAUTHORIZED");
        }

        if (job.getStatus() == ProJobStatus.COMPLETED || job.getStatus() == ProJobStatus.CANCELLED) {
            throw new BusinessException("Cannot assign providers to completed or cancelled jobs", "JOB_INVALID_STATE");
        }

        Provider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider", providerId));

        if (!providerPoolService.computeProOrdersEligible(provider)) {
            throw new BusinessException("Provider is not eligible for Pro orders", "PROVIDER_NOT_ELIGIBLE");
        }

        if (assignmentRepository.existsByJobTicketIdAndProviderId(jobId, providerId)) {
            throw new BusinessException("Provider is already assigned to this job", "DUPLICATE_ASSIGNMENT");
        }

        // Check availability conflicts (B2C & Pro)
        if (checkProviderHasConflict(providerId, job.getScheduledDate(), job.getStartTime(), job.getEndTime())) {
            throw new BusinessException("Provider has a scheduling conflict during this time slot.", "SCHEDULE_CONFLICT");
        }

        // Save Assignment
        JobAssignment assignment = JobAssignment.builder()
                .jobTicket(job)
                .provider(provider)
                .build();
        assignmentRepository.save(assignment);

        // Update Job Status
        long count = assignmentRepository.countByJobTicketId(jobId);
        if (count >= job.getWorkersRequired()) {
            job.setStatus(ProJobStatus.ASSIGNED);
        } else if (count > 0) {
            job.setStatus(ProJobStatus.PARTIALLY_ASSIGNED);
        } else {
            job.setStatus(ProJobStatus.ASSIGNING);
        }
        jobRepository.save(job);

        // Expect attendance
        Attendance attendance = Attendance.builder()
                .jobTicket(job)
                .provider(provider)
                .status(AttendanceStatus.MISSING)
                .build();
        attendanceRepository.save(attendance);

        // Calculate expected arrival Instant
        LocalDateTime expectedLdt = LocalDateTime.of(job.getScheduledDate(), job.getStartTime());
        Instant expectedArrival = expectedLdt.atZone(ZoneId.systemDefault()).toInstant();

        // Create SLA expected record
        ProJobSLA sla = ProJobSLA.builder()
                .jobTicket(job)
                .provider(provider)
                .expectedArrival(expectedArrival)
                .complianceStatus(SlaComplianceStatus.MISSING)
                .build();
        slaRepository.save(sla);

        writeAudit(organizationId, jobId, actor, "PROVIDER_ASSIGNED", "Assigned provider " + provider.getFullName());
    }

    @Transactional
    public void unassignProvider(Long organizationId, Long jobId, Long providerId, User actor) {
        ProJobTicket job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job Ticket", jobId));
        if (!job.getOrganizationId().equals(organizationId)) {
            throw new BusinessException("Unauthorized unassignment action", "UNAUTHORIZED");
        }

        JobAssignment assignment = assignmentRepository.findByJobTicketIdAndProviderId(jobId, providerId)
                .orElseThrow(() -> new BusinessException("Provider not assigned to this job", "ASSIGNMENT_NOT_FOUND"));

        assignmentRepository.delete(assignment);

        // Remove expectations
        attendanceRepository.findByJobTicketIdAndProviderId(jobId, providerId)
                .ifPresent(attendanceRepository::delete);

        slaRepository.findByJobTicketId(jobId).stream()
                .filter(s -> s.getProvider().getId().equals(providerId))
                .forEach(slaRepository::delete);

        // Recalculate status
        long count = assignmentRepository.countByJobTicketId(jobId);
        if (count == 0) {
            job.setStatus(ProJobStatus.REQUESTED);
        } else if (count < job.getWorkersRequired()) {
            job.setStatus(ProJobStatus.PARTIALLY_ASSIGNED);
        } else {
            job.setStatus(ProJobStatus.ASSIGNED);
        }
        jobRepository.save(job);

        Provider provider = providerRepository.getReferenceById(providerId);
        writeAudit(organizationId, jobId, actor, "PROVIDER_UNASSIGNED", "Unassigned provider " + provider.getFullName());
    }

    @Transactional
    public void checkInProvider(Long jobId, Long providerId, Double latitude, Double longitude, String qrCode) {
        ProJobTicket job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job Ticket", jobId));

        Attendance attendance = attendanceRepository.findByJobTicketIdAndProviderId(jobId, providerId)
                .orElseThrow(() -> new BusinessException("Provider attendance expectation not found", "ASSIGNMENT_NOT_FOUND"));

        // Validate QR Code
        if (!("jt_qr_" + jobId).equals(qrCode)) {
            throw new BusinessException("Invalid check-in QR code.", "INVALID_QR");
        }

        // Distance Check (within 500 meters)
        double distance = calculateDistance(latitude, longitude, job.getLatitude(), job.getLongitude());
        if (distance > 500.0) {
            attendance.setStatus(AttendanceStatus.REJECTED);
            attendance.setLatitude(latitude);
            attendance.setLongitude(longitude);
            attendance.setDistanceFromJob(distance);
            attendance.setLocationVerified(false);
            attendance.setRejectionReason("Distance exceeds 500m geofence. Distance: " + (int) distance + "m");
            attendanceRepository.save(attendance);
            throw new BusinessException("You must be within 500 meters of the job location to check in.", "LOCATION_OUTSIDE_RADIUS");
        }

        Instant now = Instant.now();
        LocalDateTime expectedLdt = LocalDateTime.of(job.getScheduledDate(), job.getStartTime());
        Instant expectedTime = expectedLdt.atZone(ZoneId.systemDefault()).toInstant();

        // 15 minutes grace period check
        long delayMinutes = ChronoUnit.MINUTES.between(expectedTime, now);
        AttendanceStatus status = (delayMinutes <= 15) ? AttendanceStatus.PRESENT : AttendanceStatus.LATE;

        attendance.setCheckInTime(now);
        attendance.setStatus(status);
        attendance.setLatitude(latitude);
        attendance.setLongitude(longitude);
        attendance.setDistanceFromJob(distance);
        attendance.setLocationVerified(true);
        attendanceRepository.save(attendance);

        // Update SLA record
        slaRepository.findByJobTicketId(jobId).stream()
                .filter(s -> s.getProvider().getId().equals(providerId))
                .findFirst()
                .ifPresent(s -> {
                    s.setActualArrival(now);
                    s.setArrivalDifferenceMinutes(delayMinutes);
                    s.setComplianceStatus((status == AttendanceStatus.PRESENT) ? SlaComplianceStatus.ON_TIME : SlaComplianceStatus.LATE);
                    slaRepository.save(s);
                });

        // Activate job ticket
        if (job.getStatus() == ProJobStatus.ASSIGNED || job.getStatus() == ProJobStatus.PARTIALLY_ASSIGNED) {
            job.setStatus(ProJobStatus.IN_PROGRESS);
            jobRepository.save(job);
        }

        User providerUser = providerRepository.findById(providerId).map(Provider::getUser).orElse(null);
        writeAudit(job.getOrganizationId(), jobId, providerUser, "PROVIDER_CHECKED_IN", "Checked in at distance: " + (int) distance + "m");
    }

    @Transactional
    public void completeJob(Long organizationId, Long jobId, User actor) {
        ProJobTicket job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job Ticket", jobId));
        if (!job.getOrganizationId().equals(organizationId)) {
            throw new BusinessException("Unauthorized complete action", "UNAUTHORIZED");
        }

        if (job.getStatus() != ProJobStatus.IN_PROGRESS) {
            throw new BusinessException("Only jobs in progress can be marked complete", "JOB_INVALID_STATE");
        }

        job.setStatus(ProJobStatus.COMPLETED);
        jobRepository.save(job);

        // Finalize billing
        ProJobBilling billing = billingRepository.findByJobTicketId(jobId)
                .orElseGet(() -> ProJobBilling.builder()
                        .jobTicket(job)
                        .estimatedAmount(job.getBusinessPrice())
                        .organizationId(organizationId)
                        .build());
        billing.setFinalAmount(job.getBusinessPrice());
        billing.setPaymentStatus(ProPaymentStatus.PAID);
        billing.setPaymentDate(Instant.now());
        billing.setPaymentMethod("Sandbox Gateway");
        billing.setInvoiceNumber("INV-" + LocalDate.now().getYear() + "-" + String.format("%04d", jobId));
        billingRepository.save(billing);

        // Mark checkout for checked-in providers and calculate history stats
        List<Attendance> attendances = attendanceRepository.findByJobTicketId(jobId);
        for (Attendance a : attendances) {
            if (a.getCheckInTime() != null && a.getCheckOutTime() == null) {
                a.setCheckOutTime(Instant.now());
                attendanceRepository.save(a);
            }

            // Update Provider Pool Stats
            poolEntryRepository.findByOrganizationIdAndProviderId(organizationId, a.getProvider().getId())
                    .ifPresent(entry -> {
                        long totalJobs = entry.getProJobsCompleted() != null ? entry.getProJobsCompleted() + 1 : 1;
                        entry.setProJobsCompleted((int) totalJobs);

                        // Fetch all historical attendances for this pool provider
                        List<Attendance> history = attendanceRepository.findByProviderId(a.getProvider().getId());
                        long validCheckins = history.stream()
                                .filter(h -> h.getStatus() == AttendanceStatus.PRESENT || h.getStatus() == AttendanceStatus.LATE || h.getStatus() == AttendanceStatus.CHECKED_OUT)
                                .count();
                        long onTimeCheckins = history.stream()
                                .filter(h -> h.getStatus() == AttendanceStatus.PRESENT)
                                .count();

                        entry.setAttendanceRate((double) validCheckins / history.size() * 100);
                        entry.setOnTimeRate((double) onTimeCheckins / history.size() * 100);
                        poolEntryRepository.save(entry);
                    });
        }

        writeAudit(organizationId, jobId, actor, "JOB_COMPLETED", "Job status marked completed and invoice generated.");
    }

    @Transactional(readOnly = true)
    public List<ProJobTicketResponse> getProviderJobs(Long providerId) {
        List<JobAssignment> assignments = assignmentRepository.findByProviderId(providerId);
        return assignments.stream()
                .map(JobAssignment::getJobTicket)
                .map(this::toResponse)
                .toList();
    }

    // ────────────────────────────────────────────────────────────────────
    // DASHBOARD QUERIES
    // ────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ProKpiDashboardResponse getKpiDashboard(Long organizationId) {
        long activeProviders = poolEntryRepository.findAllByOrganizationIdAndStatus(organizationId, ProviderPoolStatus.ACTIVE).size();
        long pendingApprovals = poolEntryRepository.findAllByOrganizationIdAndStatus(organizationId, ProviderPoolStatus.PENDING_APPROVAL).size();

        Pageable pageFirst = PageRequest.of(0, 1000);
        List<ProJobTicket> allJobs = jobRepository.findByOrganizationIdOrderByScheduledDateDescStartTimeDesc(organizationId, pageFirst).getContent();

        long jobsThisMonth = allJobs.stream()
                .filter(j -> j.getCreatedAt() != null && j.getCreatedAt().getMonth() == LocalDate.now().getMonth())
                .count();

        long jobsInProgress = allJobs.stream()
                .filter(j -> j.getStatus() == ProJobStatus.IN_PROGRESS)
                .count();

        List<ProJobSLA> slas = slaRepository.findByOrganizationId(organizationId);
        long onTimeCount = slas.stream().filter(s -> s.getComplianceStatus() == SlaComplianceStatus.ON_TIME).count();
        double slaRate = slas.isEmpty() ? 100.0 : (double) onTimeCount / slas.size() * 100;

        List<ProJobBilling> billings = billingRepository.findByJobTicket_OrganizationId(organizationId);
        BigDecimal spend = billings.stream()
                .filter(b -> b.getPaymentStatus() == ProPaymentStatus.PAID)
                .map(ProJobBilling::getFinalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Workforce today
        LocalDate today = LocalDate.now();
        List<Attendance> attendancesToday = attendanceRepository.findByOrganizationIdAndDate(organizationId, today);
        long expected = attendancesToday.size();
        long present = attendancesToday.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        long late = attendancesToday.stream().filter(a -> a.getStatus() == AttendanceStatus.LATE).count();
        long missing = attendancesToday.stream().filter(a -> a.getStatus() == AttendanceStatus.MISSING).count();

        return new ProKpiDashboardResponse(
                activeProviders,
                pendingApprovals,
                jobsThisMonth,
                jobsInProgress,
                slaRate,
                spend,
                expected,
                present,
                late,
                missing
        );
    }

    @Transactional(readOnly = true)
    public ProSlaDashboardResponse getSlaDashboard(Long organizationId) {
        List<ProJobSLA> slas = slaRepository.findByOrganizationId(organizationId);
        long onTimeCount = slas.stream().filter(s -> s.getComplianceStatus() == SlaComplianceStatus.ON_TIME).count();
        double overallCompliance = slas.isEmpty() ? 100.0 : (double) onTimeCount / slas.size() * 100;

        long overdue = slas.stream().filter(s -> s.getComplianceStatus() == SlaComplianceStatus.MISSING).count();

        // Calculate average arrival time
        long totalDiff = slas.stream()
                .filter(s -> s.getArrivalDifferenceMinutes() != null)
                .mapToLong(ProJobSLA::getArrivalDifferenceMinutes)
                .sum();
        long countWithArrival = slas.stream().filter(s -> s.getArrivalDifferenceMinutes() != null).count();
        String avgResponseTime = (countWithArrival == 0) ? "N/A" : (totalDiff / countWithArrival) + "m";

        // Category breakdown
        Map<String, List<ProJobSLA>> byCategory = slas.stream()
                .collect(Collectors.groupingBy(s -> s.getJobTicket().getServiceCatalog().getCategory().getName()));
        List<ProSlaDashboardResponse.CategoryPerf> categoriesList = byCategory.entrySet().stream()
                .map(e -> {
                    long catOnTime = e.getValue().stream().filter(s -> s.getComplianceStatus() == SlaComplianceStatus.ON_TIME).count();
                    double catSla = (double) catOnTime / e.getValue().size() * 100;
                    return new ProSlaDashboardResponse.CategoryPerf(e.getKey(), catSla, "#3b82f6");
                }).toList();

        // Provider rankings
        Map<Provider, List<ProJobSLA>> byProvider = slas.stream()
                .collect(Collectors.groupingBy(ProJobSLA::getProvider));
        List<ProSlaDashboardResponse.ProviderSlaPerf> providersList = byProvider.entrySet().stream()
                .map(e -> {
                    Provider provider = e.getKey();
                    long provOnTime = e.getValue().stream().filter(s -> s.getComplianceStatus() == SlaComplianceStatus.ON_TIME).count();
                    double provSla = (double) provOnTime / e.getValue().size() * 100;
                    long breaches = e.getValue().stream().filter(s -> s.getComplianceStatus() == SlaComplianceStatus.LATE || s.getComplianceStatus() == SlaComplianceStatus.MISSING).count();
                    String status = provSla >= 95.0 ? "Excellent" : provSla >= 90.0 ? "Good" : "Needs Improvement";
                    return new ProSlaDashboardResponse.ProviderSlaPerf(
                            provider.getFullName(),
                            provider.getPrimaryCategoryName(),
                            e.getValue().size(),
                            provSla,
                            breaches,
                            status
                    );
                }).toList();

        // Standard trend metrics (Jan - Jun)
        List<ProSlaDashboardResponse.MonthlyTrend> trend = List.of(
                new ProSlaDashboardResponse.MonthlyTrend("Jan", 90.0),
                new ProSlaDashboardResponse.MonthlyTrend("Feb", 92.5),
                new ProSlaDashboardResponse.MonthlyTrend("Mar", 88.0),
                new ProSlaDashboardResponse.MonthlyTrend("Apr", 91.0),
                new ProSlaDashboardResponse.MonthlyTrend("May", 94.0),
                new ProSlaDashboardResponse.MonthlyTrend("Jun", overallCompliance)
        );

        return new ProSlaDashboardResponse(
                overallCompliance,
                avgResponseTime,
                overdue,
                4.2, // standard target mock
                trend,
                categoriesList,
                providersList
        );
    }

    @Transactional(readOnly = true)
    public ProBillingDashboardResponse getBillingDashboard(Long organizationId) {
        BigDecimal totalBudget = new BigDecimal("150000.00");
        List<ProJobBilling> billings = billingRepository.findByJobTicket_OrganizationId(organizationId);

        BigDecimal spent = billings.stream()
                .filter(b -> b.getPaymentStatus() == ProPaymentStatus.PAID)
                .map(ProJobBilling::getFinalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal pending = billings.stream()
                .filter(b -> b.getPaymentStatus() == ProPaymentStatus.PENDING)
                .map(ProJobBilling::getFinalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remaining = totalBudget.subtract(spent);

        var invoices = billings.stream()
                .map(b -> {
                    LocalDate date = b.getPaymentDate() != null 
                            ? LocalDate.ofInstant(b.getPaymentDate(), ZoneId.systemDefault()) 
                            : LocalDate.now().plusDays(7);
                    return new ProBillingDashboardResponse.InvoiceInfo(
                            b.getInvoiceNumber() != null ? b.getInvoiceNumber() : "INV-DRAFT-" + b.getId(),
                            b.getJobTicket().getServiceCatalog().getSubServiceName() + " Provider",
                            b.getJobTicket().getServiceCatalog().getCategory().getName(),
                            b.getFinalAmount(),
                            b.getPaymentStatus().name(),
                            date.toString()
                    );
                }).toList();

        return new ProBillingDashboardResponse(totalBudget, spent, pending, remaining, invoices);
    }

    @Transactional(readOnly = true)
    public ProComplianceDashboardResponse getComplianceDashboard(Long organizationId) {
        List<ProviderPoolEntry> entries = poolEntryRepository.findAllByOrganizationId(organizationId);

        long approved = entries.stream().filter(e -> e.getStatus() == ProviderPoolStatus.ACTIVE).count();
        long pending = entries.stream().filter(e -> e.getStatus() == ProviderPoolStatus.PENDING_APPROVAL).count();
        long declined = entries.stream().filter(e -> e.getStatus() == ProviderPoolStatus.DECLINED).count();

        var providers = entries.stream()
                .map(e -> new ProComplianceDashboardResponse.ProviderVerificationRow(
                        e.getProvider().getFullName(),
                        e.getProvider().getPrimaryCategoryName(),
                        e.getProvider().getIsVerified() ? "APPROVED" : "PENDING",
                        "2026-08-20"
                )).toList();

        var logs = auditLogRepository.findByOrganizationIdOrderByTimestampDesc(organizationId).stream()
                .map(l -> new ProComplianceDashboardResponse.AuditLogRow(
                        l.getTimestamp().toString(),
                        l.getAction(),
                        l.getDetails(),
                        l.getActorName(),
                        "VERIFIED"
                )).toList();

        return new ProComplianceDashboardResponse(approved, pending, declined, providers, logs);
    }

    // ────────────────────────────────────────────────────────────────────
    // HELPER METHODS
    // ────────────────────────────────────────────────────────────────────

    private boolean checkProviderHasConflict(Long providerId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        // 1. Overlapping B2C slot check
        if (startTime.isBefore(LocalTime.of(12, 0)) && endTime.isAfter(LocalTime.of(8, 0))) {
            if (appointmentRepository.existsActiveBooking(providerId, date, TimeSlot.MORNING)) return true;
        }
        if (startTime.isBefore(LocalTime.of(16, 0)) && endTime.isAfter(LocalTime.of(12, 0))) {
            if (appointmentRepository.existsActiveBooking(providerId, date, TimeSlot.AFTERNOON)) return true;
        }
        if (startTime.isBefore(LocalTime.of(20, 0)) && endTime.isAfter(LocalTime.of(16, 0))) {
            if (appointmentRepository.existsActiveBooking(providerId, date, TimeSlot.EVENING)) return true;
        }

        // 2. Overlapping Pro Job assignments check
        List<JobAssignment> overlapJobs = assignmentRepository.findOverlappingAssignments(providerId, date, startTime, endTime);
        return !overlapJobs.isEmpty();
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c * 1000; // in meters
    }

    private void writeAudit(Long organizationId, Long jobId, User actor, String action, String details) {
        ProAuditLog log = ProAuditLog.builder()
                .organizationId(organizationId)
                .jobTicketId(jobId)
                .actorUserId(actor != null ? actor.getId() : 0L)
                .actorName(actor != null ? actor.getEmail() : "System")
                .action(action)
                .details(details)
                .build();
        auditLogRepository.save(log);
    }

    private ProJobTicketResponse toResponse(ProJobTicket job) {
        var service = job.getServiceCatalog();
        return new ProJobTicketResponse(
                job.getId(),
                "JT-" + job.getId(),
                job.getTitle(),
                service.getId(),
                service.getCategory().getName(),
                service.getSubServiceName(),
                job.getWorkersRequired(),
                job.getScheduledDate(),
                job.getStartTime(),
                job.getEndTime(),
                job.getLocation(),
                job.getInstructions(),
                job.getPricingModel(),
                job.getBusinessPrice(),
                job.getProviderEarning(),
                job.getStatus(),
                job.getCreatedAt()
        );
    }
}
