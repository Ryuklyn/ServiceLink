package com.servicelink.core.service.provider;

import com.servicelink.core.dto.response.provider.ProviderAnalyticsResponseDTO;
import com.servicelink.core.dto.response.provider.ProviderEarningsResponseDTO;
import com.servicelink.core.exception.ResourceNotFoundException;
import com.servicelink.core.model.appointment.Appointment;
import com.servicelink.core.model.appointment.AppointmentStatus;
import com.servicelink.core.model.business.Organization;
import com.servicelink.core.model.business.job.JobAssignment;
import com.servicelink.core.model.business.job.ProJobStatus;
import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.model.provider.review.Review;
import com.servicelink.core.model.user.User;
import com.servicelink.core.repository.UserRepository;
import com.servicelink.core.repository.appointment.AppointmentRepository;
import com.servicelink.core.repository.appointment.ReviewRepository;
import com.servicelink.core.repository.business.OrganizationRepository;
import com.servicelink.core.repository.business.job.JobAssignmentRepository;
import com.servicelink.core.repository.provider.ProviderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProviderInsightsService {

    private final ProviderRepository providerRepo;
    private final AppointmentRepository appointmentRepo;
    private final JobAssignmentRepository jobAssignmentRepo;
    private final ReviewRepository reviewRepo;
    private final UserRepository userRepo;
    private final OrganizationRepository organizationRepo;

    private static final ZoneId NEPAL_ZONE = ZoneId.of("Asia/Kathmandu");
    private static final List<String> COLORS = List.of("#e8683f", "#1e3a8a", "#3b6fd4", "#f4a27a", "#10b981", "#6366f1", "#f59e0b");

    @Transactional(readOnly = true)
    public ProviderAnalyticsResponseDTO getAnalytics(Long userId, String range) {
        Provider provider = resolveProvider(userId);
        Long providerId = provider.getId();

        LocalDate[] dates = resolveDateRange(range);
        LocalDate startDate = dates[0];
        LocalDate endDate = dates[1];

        Instant startInstant = startDate.atStartOfDay(NEPAL_ZONE).toInstant();
        Instant endInstant = endDate.plusDays(1).atStartOfDay(NEPAL_ZONE).toInstant();

        // 1. Fetch relevant data in range
        List<Appointment> appointments = appointmentRepo.findByProviderIdAndDateRange(providerId, startDate, endDate);
        List<JobAssignment> assignments = jobAssignmentRepo.findByProviderIdAndDateRange(providerId, startDate, endDate);
        List<Review> reviews = reviewRepo.findByProviderIdAndDateRange(providerId, startInstant, endInstant);

        // 2. Summary stats
        int b2cTotal = appointments.size();
        int b2cAccepted = (int) appointments.stream().filter(a -> a.getStatus() != AppointmentStatus.PENDING).count();
        int b2bTotal = assignments.size();
        int b2bAccepted = (int) assignments.stream().filter(a -> "ACCEPTED".equalsIgnoreCase(String.valueOf(a.getStatus()))).count();

        int totalBookings = b2cTotal + b2bTotal;
        double acceptanceRate = totalBookings == 0 ? 100.0 :
                ((double) (b2cAccepted + b2bAccepted) / totalBookings) * 100.0;

        // Repeat customer rate
        Set<Long> uniqueCustomers = new HashSet<>();
        Map<Long, Integer> customerBookingCounts = new HashMap<>();
        for (Appointment a : appointments) {
            uniqueCustomers.add(a.getCustomerId());
            customerBookingCounts.put(a.getCustomerId(), customerBookingCounts.getOrDefault(a.getCustomerId(), 0) + 1);
        }
        for (JobAssignment a : assignments) {
            Long orgId = a.getJobTicket().getOrganizationId();
            uniqueCustomers.add(orgId);
            customerBookingCounts.put(orgId, customerBookingCounts.getOrDefault(orgId, 0) + 1);
        }
        long repeatCustomers = customerBookingCounts.values().stream().filter(count -> count >= 2).count();
        double repeatCustomerRate = uniqueCustomers.isEmpty() ? 0.0 :
                ((double) repeatCustomers / uniqueCustomers.size()) * 100.0;

        // Average response time
        double avgResponseTime = appointments.stream()
                .filter(a -> a.getConfirmedAt() != null)
                .mapToLong(a -> Duration.between(a.getScheduledAt(), a.getConfirmedAt()).toMinutes())
                .average()
                .orElse(4.0); // fallback default response time

        ProviderAnalyticsResponseDTO.Summary summary = ProviderAnalyticsResponseDTO.Summary.builder()
                .totalBookings(totalBookings)
                .acceptanceRate(Math.round(acceptanceRate * 10.0) / 10.0)
                .repeatCustomerRate(Math.round(repeatCustomerRate * 10.0) / 10.0)
                .averageResponseTime(Math.round(avgResponseTime * 10.0) / 10.0)
                .build();

        // 3. Booking Trend
        List<ProviderAnalyticsResponseDTO.TrendItem> trend = generateBookingTrend(range, startDate, endDate, appointments, assignments);

        // 4. Service Categories
        List<ProviderAnalyticsResponseDTO.CategoryItem> categoryItems = generateCategoryDistribution(appointments, assignments);

        // 5. Peak Hours Heatmap (7 days x 11 hours: 8am - 6pm)
        List<List<Integer>> peakHours = generatePeakHoursHeatmap(appointments, assignments);

        // 6. Ratings
        double avgRating = reviews.stream().mapToInt(Review::getRating).average().orElse(5.0);
        int totalReviews = reviews.size();
        List<ProviderAnalyticsResponseDTO.RatingItem> distribution = new ArrayList<>();
        for (int star = 5; star >= 1; star--) {
            int finalStar = star;
            long count = reviews.stream().filter(r -> r.getRating() == finalStar).count();
            double pct = totalReviews == 0 ? 0.0 : ((double) count / totalReviews) * 100.0;
            distribution.add(new ProviderAnalyticsResponseDTO.RatingItem(star, Math.round(pct * 10.0) / 10.0));
        }
        ProviderAnalyticsResponseDTO.Ratings ratingsDto = ProviderAnalyticsResponseDTO.Ratings.builder()
                .average(Math.round(avgRating * 10.0) / 10.0)
                .totalReviews(totalReviews)
                .distribution(distribution)
                .build();

        // 7. Coverage map
        List<ProviderAnalyticsResponseDTO.CoverageItem> coverage = generateCoverageMap(provider, appointments, assignments);

        return ProviderAnalyticsResponseDTO.builder()
                .summary(summary)
                .bookingTrend(trend)
                .serviceCategories(categoryItems)
                .peakHours(peakHours)
                .ratings(ratingsDto)
                .coverage(coverage)
                .build();
    }

    @Transactional(readOnly = true)
    public ProviderEarningsResponseDTO getEarnings(Long userId, String range) {
        Provider provider = resolveProvider(userId);
        Long providerId = provider.getId();

        LocalDate[] dates = resolveDateRange(range);
        LocalDate startDate = dates[0];
        LocalDate endDate = dates[1];

        List<Appointment> appointments = appointmentRepo.findByProviderIdAndDateRange(providerId, startDate, endDate);
        List<JobAssignment> assignments = jobAssignmentRepo.findByProviderIdAndDateRange(providerId, startDate, endDate);

        // 1. Calculate Summary Metrics
        long completedB2cEarnings = appointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                .mapToLong(a -> a.getFinalAmount() != null ? a.getFinalAmount() : (a.getTotalPrice() != null ? a.getTotalPrice() : 0L))
                .sum();

        long completedB2bEarnings = assignments.stream()
                .filter(a -> a.getJobTicket().getStatus() == ProJobStatus.COMPLETED && "ACCEPTED".equalsIgnoreCase(String.valueOf(a.getStatus())))
                .mapToLong(a -> a.getJobTicket().getProviderEarning() != null ? a.getJobTicket().getProviderEarning().longValue() : 0L)
                .sum();

        long totalEarned = completedB2cEarnings + completedB2bEarnings;

        long completedB2cJobs = appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).count();
        long completedB2bJobs = assignments.stream().filter(a -> a.getJobTicket().getStatus() == ProJobStatus.COMPLETED && "ACCEPTED".equalsIgnoreCase(String.valueOf(a.getStatus()))).count();
        int completedJobs = (int) (completedB2cJobs + completedB2bJobs);

        double averagePerJob = completedJobs == 0 ? 0.0 : (double) totalEarned / completedJobs;

        // Pending amount
        long pendingB2c = appointments.stream()
                .filter(a -> a.getStatus() != AppointmentStatus.COMPLETED && a.getStatus() != AppointmentStatus.CANCELLED)
                .mapToLong(a -> a.getFinalAmount() != null ? a.getFinalAmount() : (a.getTotalPrice() != null ? a.getTotalPrice() : 0L))
                .sum();

        long pendingB2b = assignments.stream()
                .filter(a -> a.getJobTicket().getStatus() != ProJobStatus.COMPLETED && a.getJobTicket().getStatus() != ProJobStatus.CANCELLED && "ACCEPTED".equalsIgnoreCase(String.valueOf(a.getStatus())))
                .mapToLong(a -> a.getJobTicket().getProviderEarning() != null ? a.getJobTicket().getProviderEarning().longValue() : 0L)
                .sum();

        long pendingAmount = pendingB2c + pendingB2b;

        ProviderEarningsResponseDTO.Summary summary = ProviderEarningsResponseDTO.Summary.builder()
                .totalEarned(totalEarned)
                .completedJobs(completedJobs)
                .averagePerJob(Math.round(averagePerJob * 100.0) / 100.0)
                .pendingAmount(pendingAmount)
                .build();

        // 2. Revenue Trend
        List<ProviderEarningsResponseDTO.RevenueTrendItem> revenueTrend = generateRevenueTrend(range, startDate, endDate, appointments, assignments);

        // 3. Top Services
        List<ProviderEarningsResponseDTO.TopServiceItem> topServices = generateTopServices(appointments, assignments);

        // 4. Recent Payments
        List<ProviderEarningsResponseDTO.PaymentItem> recentPayments = generatePaymentHistory(appointments, assignments);

        return ProviderEarningsResponseDTO.builder()
                .summary(summary)
                .revenueTrend(revenueTrend)
                .topServices(topServices)
                .recentPayments(recentPayments)
                .build();
    }

    private Provider resolveProvider(Long userId) {
        return providerRepo.findByUser_Id(userId)
                .filter(Provider::getIsActive)
                .orElseThrow(() -> new ResourceNotFoundException("Active provider profile not found for user: " + userId));
    }

    private LocalDate[] resolveDateRange(String range) {
        LocalDate today = LocalDate.now(NEPAL_ZONE);
        LocalDate startDate;
        LocalDate endDate = today;

        if ("This Week".equalsIgnoreCase(range)) {
            startDate = today.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        } else if ("Last 3 Months".equalsIgnoreCase(range)) {
            startDate = today.minusMonths(3);
        } else if ("This Year".equalsIgnoreCase(range)) {
            startDate = today.withDayOfYear(1);
        } else {
            // Default "This Month"
            startDate = today.withDayOfMonth(1);
        }

        return new LocalDate[]{startDate, endDate};
    }

    private List<ProviderAnalyticsResponseDTO.TrendItem> generateBookingTrend(
            String range, LocalDate startDate, LocalDate endDate,
            List<Appointment> appointments, List<JobAssignment> assignments) {

        Map<String, Integer> counts = new LinkedHashMap<>();

        if ("This Week".equalsIgnoreCase(range)) {
            List<String> days = List.of("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun");
            days.forEach(d -> counts.put(d, 0));

            for (Appointment a : appointments) {
                String dayLabel = getDayLabel(a.getAppointmentDate());
                counts.put(dayLabel, counts.getOrDefault(dayLabel, 0) + 1);
            }
            for (JobAssignment a : assignments) {
                String dayLabel = getDayLabel(a.getJobTicket().getStartDate());
                counts.put(dayLabel, counts.getOrDefault(dayLabel, 0) + 1);
            }
        } else if ("This Month".equalsIgnoreCase(range)) {
            int length = startDate.lengthOfMonth();
            for (int i = 1; i <= length; i++) {
                counts.put(String.valueOf(i), 0);
            }
            for (Appointment a : appointments) {
                String dayStr = String.valueOf(a.getAppointmentDate().getDayOfMonth());
                counts.put(dayStr, counts.getOrDefault(dayStr, 0) + 1);
            }
            for (JobAssignment a : assignments) {
                String dayStr = String.valueOf(a.getJobTicket().getStartDate().getDayOfMonth());
                counts.put(dayStr, counts.getOrDefault(dayStr, 0) + 1);
            }
        } else if ("Last 3 Months".equalsIgnoreCase(range)) {
            // Group by month
            LocalDate m1 = startDate;
            LocalDate m2 = startDate.plusMonths(1);
            LocalDate m3 = startDate.plusMonths(2);
            LocalDate m4 = startDate.plusMonths(3);

            counts.put(m1.getMonth().name().substring(0, 3), 0);
            counts.put(m2.getMonth().name().substring(0, 3), 0);
            counts.put(m3.getMonth().name().substring(0, 3), 0);
            counts.put(m4.getMonth().name().substring(0, 3), 0);

            for (Appointment a : appointments) {
                String monthLabel = a.getAppointmentDate().getMonth().name().substring(0, 3);
                counts.put(monthLabel, counts.getOrDefault(monthLabel, 0) + 1);
            }
            for (JobAssignment a : assignments) {
                String monthLabel = a.getJobTicket().getStartDate().getMonth().name().substring(0, 3);
                counts.put(monthLabel, counts.getOrDefault(monthLabel, 0) + 1);
            }
        } else {
            // This Year: group by 12 months
            List<String> months = List.of("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
            months.forEach(m -> counts.put(m, 0));

            for (Appointment a : appointments) {
                String monthLabel = months.get(a.getAppointmentDate().getMonthValue() - 1);
                counts.put(monthLabel, counts.getOrDefault(monthLabel, 0) + 1);
            }
            for (JobAssignment a : assignments) {
                String monthLabel = months.get(a.getJobTicket().getStartDate().getMonthValue() - 1);
                counts.put(monthLabel, counts.getOrDefault(monthLabel, 0) + 1);
            }
        }

        return counts.entrySet().stream()
                .map(e -> new ProviderAnalyticsResponseDTO.TrendItem(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }

    private String getDayLabel(LocalDate date) {
        return switch (date.getDayOfWeek()) {
            case MONDAY -> "Mon";
            case TUESDAY -> "Tue";
            case WEDNESDAY -> "Wed";
            case THURSDAY -> "Thu";
            case FRIDAY -> "Fri";
            case SATURDAY -> "Sat";
            case SUNDAY -> "Sun";
        };
    }

    private List<ProviderAnalyticsResponseDTO.CategoryItem> generateCategoryDistribution(
            List<Appointment> appointments, List<JobAssignment> assignments) {

        Map<String, Integer> categoryCounts = new HashMap<>();
        for (Appointment a : appointments) {
            String catName = a.getServiceCatalog().getCategory().getName();
            categoryCounts.put(catName, categoryCounts.getOrDefault(catName, 0) + 1);
        }
        for (JobAssignment a : assignments) {
            String catName = a.getJobTicket().getServiceCatalog().getCategory().getName();
            categoryCounts.put(catName, categoryCounts.getOrDefault(catName, 0) + 1);
        }

        int total = categoryCounts.values().stream().mapToInt(Integer::intValue).sum();
        if (total == 0) return Collections.emptyList();

        List<Map.Entry<String, Integer>> sorted = categoryCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .toList();

        List<ProviderAnalyticsResponseDTO.CategoryItem> items = new ArrayList<>();
        for (int i = 0; i < sorted.size(); i++) {
            Map.Entry<String, Integer> entry = sorted.get(i);
            double pct = ((double) entry.getValue() / total) * 100.0;
            String color = COLORS.get(i % COLORS.size());
            items.add(new ProviderAnalyticsResponseDTO.CategoryItem(
                    entry.getKey(),
                    Math.round(pct * 10.0) / 10.0,
                    color
            ));
        }
        return items;
    }

    private List<List<Integer>> generatePeakHoursHeatmap(
            List<Appointment> appointments, List<JobAssignment> assignments) {

        // 7 days x 11 hours (8am to 6pm)
        int[][] grid = new int[7][11];

        for (Appointment a : appointments) {
            int dayIdx = a.getAppointmentDate().getDayOfWeek().getValue() - 1; // 0-indexed Mon-Sun
            int hour = a.getEstimatedStartTime() != null ? a.getEstimatedStartTime().getHour() :
                    (a.getScheduledAt() != null ? a.getScheduledAt().getHour() : 10);
            if (hour >= 8 && hour <= 18) {
                grid[dayIdx][hour - 8]++;
            }
        }

        for (JobAssignment a : assignments) {
            int dayIdx = a.getJobTicket().getStartDate().getDayOfWeek().getValue() - 1;
            int hour = a.getJobTicket().getStartTime() != null ? a.getJobTicket().getStartTime().getHour() : 10;
            if (hour >= 8 && hour <= 18) {
                grid[dayIdx][hour - 8]++;
            }
        }

        int max = 0;
        for (int d = 0; d < 7; d++) {
            for (int h = 0; h < 11; h++) {
                if (grid[d][h] > max) max = grid[d][h];
            }
        }

        List<List<Integer>> responseGrid = new ArrayList<>();
        for (int d = 0; d < 7; d++) {
            List<Integer> row = new ArrayList<>();
            for (int h = 0; h < 11; h++) {
                row.add(grid[d][h]);
            }
            responseGrid.add(row);
        }

        return responseGrid;
    }

    private List<ProviderAnalyticsResponseDTO.CoverageItem> generateCoverageMap(
            Provider provider, List<Appointment> appointments, List<JobAssignment> assignments) {

        List<ProviderAnalyticsResponseDTO.CoverageItem> items = new ArrayList<>();
        double baseLat = provider.getLatitude() != null ? provider.getLatitude() : 27.7172;
        double baseLng = provider.getLongitude() != null ? provider.getLongitude() : 85.324;

        Random rand = new Random(provider.getId());

        // B2B jobs have real coordinates
        for (JobAssignment a : assignments) {
            Double lat = a.getJobTicket().getLatitude();
            Double lng = a.getJobTicket().getLongitude();
            if (lat != null && lng != null) {
                items.add(new ProviderAnalyticsResponseDTO.CoverageItem(lat, lng, a.getJobTicket().getTitle()));
            }
        }

        // B2C appointments have only address, generate secure minor randomized offset markers centered on base
        for (Appointment a : appointments) {
            double offsetLat = (rand.nextDouble() - 0.5) * 0.03;
            double offsetLng = (rand.nextDouble() - 0.5) * 0.03;
            items.add(new ProviderAnalyticsResponseDTO.CoverageItem(
                    baseLat + offsetLat,
                    baseLng + offsetLng,
                    a.getServiceCatalog().getSubServiceName() + " (" + a.getAddress() + ")"
            ));
        }

        return items;
    }

    private List<ProviderEarningsResponseDTO.RevenueTrendItem> generateRevenueTrend(
            String range, LocalDate startDate, LocalDate endDate,
            List<Appointment> appointments, List<JobAssignment> assignments) {

        Map<String, Long> trendMap = new LinkedHashMap<>();

        if ("This Week".equalsIgnoreCase(range)) {
            List<String> days = List.of("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun");
            days.forEach(d -> trendMap.put(d, 0L));

            for (Appointment a : appointments) {
                if (a.getStatus() == AppointmentStatus.COMPLETED) {
                    String dayLabel = getDayLabel(a.getAppointmentDate());
                    long amt = a.getFinalAmount() != null ? a.getFinalAmount() : (a.getTotalPrice() != null ? a.getTotalPrice() : 0);
                    trendMap.put(dayLabel, trendMap.getOrDefault(dayLabel, 0L) + amt);
                }
            }
            for (JobAssignment a : assignments) {
                if (a.getJobTicket().getStatus() == ProJobStatus.COMPLETED && "ACCEPTED".equalsIgnoreCase(String.valueOf(a.getStatus()))) {
                    String dayLabel = getDayLabel(a.getJobTicket().getStartDate());
                    long amt = a.getJobTicket().getProviderEarning() != null ? a.getJobTicket().getProviderEarning().longValue() : 0;
                    trendMap.put(dayLabel, trendMap.getOrDefault(dayLabel, 0L) + amt);
                }
            }
        } else if ("This Month".equalsIgnoreCase(range)) {
            int length = startDate.lengthOfMonth();
            for (int i = 1; i <= length; i++) {
                trendMap.put(String.valueOf(i), 0L);
            }
            for (Appointment a : appointments) {
                if (a.getStatus() == AppointmentStatus.COMPLETED) {
                    String dayStr = String.valueOf(a.getAppointmentDate().getDayOfMonth());
                    long amt = a.getFinalAmount() != null ? a.getFinalAmount() : (a.getTotalPrice() != null ? a.getTotalPrice() : 0);
                    trendMap.put(dayStr, trendMap.getOrDefault(dayStr, 0L) + amt);
                }
            }
            for (JobAssignment a : assignments) {
                if (a.getJobTicket().getStatus() == ProJobStatus.COMPLETED && "ACCEPTED".equalsIgnoreCase(String.valueOf(a.getStatus()))) {
                    String dayStr = String.valueOf(a.getJobTicket().getStartDate().getDayOfMonth());
                    long amt = a.getJobTicket().getProviderEarning() != null ? a.getJobTicket().getProviderEarning().longValue() : 0;
                    trendMap.put(dayStr, trendMap.getOrDefault(dayStr, 0L) + amt);
                }
            }
        } else if ("Last 3 Months".equalsIgnoreCase(range)) {
            LocalDate m1 = startDate;
            LocalDate m2 = startDate.plusMonths(1);
            LocalDate m3 = startDate.plusMonths(2);
            LocalDate m4 = startDate.plusMonths(3);

            trendMap.put(m1.getMonth().name().substring(0, 3), 0L);
            trendMap.put(m2.getMonth().name().substring(0, 3), 0L);
            trendMap.put(m3.getMonth().name().substring(0, 3), 0L);
            trendMap.put(m4.getMonth().name().substring(0, 3), 0L);

            for (Appointment a : appointments) {
                if (a.getStatus() == AppointmentStatus.COMPLETED) {
                    String monthLabel = a.getAppointmentDate().getMonth().name().substring(0, 3);
                    long amt = a.getFinalAmount() != null ? a.getFinalAmount() : (a.getTotalPrice() != null ? a.getTotalPrice() : 0);
                    trendMap.put(monthLabel, trendMap.getOrDefault(monthLabel, 0L) + amt);
                }
            }
            for (JobAssignment a : assignments) {
                if (a.getJobTicket().getStatus() == ProJobStatus.COMPLETED && "ACCEPTED".equalsIgnoreCase(String.valueOf(a.getStatus()))) {
                    String monthLabel = a.getJobTicket().getStartDate().getMonth().name().substring(0, 3);
                    long amt = a.getJobTicket().getProviderEarning() != null ? a.getJobTicket().getProviderEarning().longValue() : 0;
                    trendMap.put(monthLabel, trendMap.getOrDefault(monthLabel, 0L) + amt);
                }
            }
        } else {
            List<String> months = List.of("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
            months.forEach(m -> trendMap.put(m, 0L));

            for (Appointment a : appointments) {
                if (a.getStatus() == AppointmentStatus.COMPLETED) {
                    String monthLabel = months.get(a.getAppointmentDate().getMonthValue() - 1);
                    long amt = a.getFinalAmount() != null ? a.getFinalAmount() : (a.getTotalPrice() != null ? a.getTotalPrice() : 0);
                    trendMap.put(monthLabel, trendMap.getOrDefault(monthLabel, 0L) + amt);
                }
            }
            for (JobAssignment a : assignments) {
                if (a.getJobTicket().getStatus() == ProJobStatus.COMPLETED && "ACCEPTED".equalsIgnoreCase(String.valueOf(a.getStatus()))) {
                    String monthLabel = months.get(a.getJobTicket().getStartDate().getMonthValue() - 1);
                    long amt = a.getJobTicket().getProviderEarning() != null ? a.getJobTicket().getProviderEarning().longValue() : 0;
                    trendMap.put(monthLabel, trendMap.getOrDefault(monthLabel, 0L) + amt);
                }
            }
        }

        return trendMap.entrySet().stream()
                .map(e -> new ProviderEarningsResponseDTO.RevenueTrendItem(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }

    private List<ProviderEarningsResponseDTO.TopServiceItem> generateTopServices(
            List<Appointment> appointments, List<JobAssignment> assignments) {

        Map<String, Long> serviceRevenue = new HashMap<>();

        for (Appointment a : appointments) {
            if (a.getStatus() == AppointmentStatus.COMPLETED) {
                String subservice = a.getServiceCatalog().getSubServiceName();
                long amt = a.getFinalAmount() != null ? a.getFinalAmount() : (a.getTotalPrice() != null ? a.getTotalPrice() : 0);
                serviceRevenue.put(subservice, serviceRevenue.getOrDefault(subservice, 0L) + amt);
            }
        }

        for (JobAssignment a : assignments) {
            if (a.getJobTicket().getStatus() == ProJobStatus.COMPLETED && "ACCEPTED".equalsIgnoreCase(String.valueOf(a.getStatus()))) {
                String subservice = a.getJobTicket().getServiceCatalog().getSubServiceName();
                long amt = a.getJobTicket().getProviderEarning() != null ? a.getJobTicket().getProviderEarning().longValue() : 0;
                serviceRevenue.put(subservice, serviceRevenue.getOrDefault(subservice, 0L) + amt);
            }
        }

        List<Map.Entry<String, Long>> sorted = serviceRevenue.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .toList();

        List<ProviderEarningsResponseDTO.TopServiceItem> list = new ArrayList<>();
        for (int i = 0; i < sorted.size(); i++) {
            Map.Entry<String, Long> entry = sorted.get(i);
            String color = COLORS.get(i % COLORS.size());
            list.add(new ProviderEarningsResponseDTO.TopServiceItem(entry.getKey(), entry.getValue(), color));
        }

        return list;
    }

    private List<ProviderEarningsResponseDTO.PaymentItem> generatePaymentHistory(
            List<Appointment> appointments, List<JobAssignment> assignments) {

        List<ProviderEarningsResponseDTO.PaymentItem> list = new ArrayList<>();

        // Batch load B2C customers
        Set<Long> userIds = appointments.stream().map(Appointment::getCustomerId).collect(Collectors.toSet());
        Map<Long, User> customerMap = userRepo.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        // Batch load B2B organizations
        Set<Long> orgIds = assignments.stream().map(a -> a.getJobTicket().getOrganizationId()).collect(Collectors.toSet());
        Map<Long, Organization> orgMap = organizationRepo.findAllById(orgIds).stream()
                .collect(Collectors.toMap(Organization::getId, Function.identity()));

        for (Appointment a : appointments) {
            User c = customerMap.get(a.getCustomerId());
            String cName = c != null ? c.getFullName() : "Customer #" + a.getCustomerId();
            long amt = a.getFinalAmount() != null ? a.getFinalAmount() : (a.getTotalPrice() != null ? a.getTotalPrice() : 0);

            String status = "Pending";
            if (a.getStatus() == AppointmentStatus.COMPLETED) {
                status = "Paid";
            } else if (a.getStatus() == AppointmentStatus.CANCELLED) {
                status = "Refunded";
            }

            list.add(ProviderEarningsResponseDTO.PaymentItem.builder()
                    .id("BK-2026-" + String.format("%03d", a.getId() % 1000))
                    .customer(cName)
                    .service(a.getServiceCatalog().getSubServiceName())
                    .date(a.getAppointmentDate().toString())
                    .amount("Rs. " + amt)
                    .status(status)
                    .build());
        }

        for (JobAssignment a : assignments) {
            Organization org = orgMap.get(a.getJobTicket().getOrganizationId());
            String orgName = org != null ? org.getCompanyName() : "Organization #" + a.getJobTicket().getOrganizationId();
            long amt = a.getJobTicket().getProviderEarning() != null ? a.getJobTicket().getProviderEarning().longValue() : 0;

            String status = "Pending";
            if (a.getJobTicket().getStatus() == ProJobStatus.COMPLETED) {
                status = "Paid";
            } else if (a.getJobTicket().getStatus() == ProJobStatus.CANCELLED) {
                status = "Refunded";
            }

            list.add(ProviderEarningsResponseDTO.PaymentItem.builder()
                    .id("JB-2026-" + String.format("%03d", a.getJobTicket().getId() % 1000))
                    .customer(orgName)
                    .service(a.getJobTicket().getServiceCatalog().getSubServiceName())
                    .date(a.getJobTicket().getStartDate().toString())
                    .amount("Rs. " + amt)
                    .status(status)
                    .build());
        }

        // Sort by Date descending
        list.sort(Comparator.comparing(ProviderEarningsResponseDTO.PaymentItem::getDate).reversed());
        return list;
    }
}
