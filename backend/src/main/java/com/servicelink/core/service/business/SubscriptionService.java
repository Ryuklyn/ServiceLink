package com.servicelink.core.service.business;

import com.servicelink.core.dto.request.business.SubscriptionRequest;
import com.servicelink.core.dto.response.business.SubscriptionResponse;
import com.servicelink.core.model.business.PlanType;
import com.servicelink.core.model.business.Subscription;
import com.servicelink.core.model.business.SubscriptionStatus;
import com.servicelink.core.model.business.Workspace;
import com.servicelink.core.repository.business.OrganizationRepository;
import com.servicelink.core.repository.business.SubscriptionRepository;
import com.servicelink.core.repository.business.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.servicelink.core.dto.response.admin.subscription.ProSubscriptionStatsDTO;
import com.servicelink.core.dto.response.admin.subscription.ProAdminSubscriptionRowDTO;
import com.servicelink.core.dto.response.admin.subscription.ProSubscriptionHistoryDTO;
import com.servicelink.core.dto.response.admin.subscription.SystemEventDTO;
import com.servicelink.core.dto.response.business.PaymentTransactionResponse;
import com.servicelink.core.model.business.ProPaymentTransaction;
import com.servicelink.core.repository.business.ProPaymentTransactionRepository;
import com.servicelink.core.mapper.business.ProPaymentMapper;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicLong;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final WorkspaceRepository workspaceRepository;
    private final BusinessRegistrationSessionService sessionService;
    private final ProPaymentTransactionRepository proPaymentTransactionRepository;
    private final ProPaymentMapper proPaymentMapper;

    // Simple sequential ref counter — replace with DB sequence in production
    private static final AtomicLong REF_COUNTER = new AtomicLong(19502L);

    @Transactional
    public SubscriptionResponse create(SubscriptionRequest request) {

        Workspace workspace = workspaceRepository.findById(request.getWorkspaceId())
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        if (subscriptionRepository.findByWorkspaceId(workspace.getId()).isPresent()) {
            throw new IllegalStateException("Subscription already exists for this workspace.");
        }

        String referenceId = generateReferenceId();

        Subscription sub = Subscription.builder()
                .workspace(workspace)
                .planType(request.getPlanType())
                .amountNpr(request.getAmountNpr())
                .referenceId(referenceId)
                .trialEndsAt(LocalDateTime.now().plusDays(14))
                .build();

        Subscription saved = subscriptionRepository.save(sub);
        sessionService.clearSession(workspace.getOrganization().getId());

        return toResponse(saved);
    }

    public SubscriptionResponse findByWorkspace(Long workspaceId) {

        return toResponse(
                subscriptionRepository.findByWorkspaceId(workspaceId)
                        .orElseThrow(() ->
                                new RuntimeException("No subscription for workspace: " + workspaceId)
                        )
        );
    }

    private SubscriptionResponse toResponse(Subscription s) {

        return SubscriptionResponse.builder()
                .id(s.getId())
                .workspaceId(s.getWorkspace().getId())
                .planType(s.getPlanType())
                .amountNpr(s.getAmountNpr())
                .status(s.getSubscriptionStatus())
                .referenceId(s.getReferenceId())
                .trialEndsAt(s.getTrialEndsAt())
                .currentPeriodStart(s.getCurrentPeriodStart())
                .currentPeriodEnd(s.getCurrentPeriodEnd())
                .createdAt(s.getCreatedAt())
                .build();
    }

    private String generateReferenceId() {

        int year = LocalDate.now().getYear();
        long seq = REF_COUNTER.getAndIncrement();

        return String.format("SLP-%d-%06d", year, seq);
    }

//    @Transactional
//    public SubscriptionResponse activateAfterPayment(Long subscriptionId, PlanType newPlan, Long amountNpr) {
//        Subscription sub = subscriptionRepository.findById(subscriptionId)
//                .orElseThrow(() -> new RuntimeException("Subscription not found: " + subscriptionId));
//
//        sub.setPlanType(newPlan);
//        sub.setAmountNpr(amountNpr);
//        sub.setSubscriptionStatus(SubscriptionStatus.ACTIVE);
//        sub.setCurrentPeriodStart(LocalDateTime.now());
//        sub.setCurrentPeriodEnd(LocalDateTime.now().plusDays(30));
//
//        return toResponse(subscriptionRepository.save(sub));
//    }

    @Transactional
    public SubscriptionResponse activateAfterPayment(Long subscriptionId, PlanType planType, Long amountNpr) {
        Subscription sub = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found: " + subscriptionId));

        sub.setPlanType(planType);
        sub.setAmountNpr(amountNpr);
        sub.setSubscriptionStatus(SubscriptionStatus.ACTIVE);
        sub.setCurrentPeriodStart(LocalDateTime.now());
        sub.setCurrentPeriodEnd(LocalDateTime.now().plusDays(30));   // ← 30 days, both Starter & Growth

        return toResponse(subscriptionRepository.save(sub));
    }

    @Transactional(readOnly = true)
    public ProSubscriptionStatsDTO getProStats() {
        List<Subscription> subs = subscriptionRepository.findAll();
        long activeCount = subs.stream().filter(s -> s.getSubscriptionStatus() == SubscriptionStatus.ACTIVE).count();
        long trialCount = subs.stream().filter(s -> s.getSubscriptionStatus() == SubscriptionStatus.TRIAL).count();
        LocalDateTime sevenDaysLater = LocalDateTime.now().plusDays(7);
        long expiringSoon = subs.stream()
                .filter(s -> s.getSubscriptionStatus() == SubscriptionStatus.ACTIVE 
                        && s.getCurrentPeriodEnd() != null 
                        && s.getCurrentPeriodEnd().isAfter(LocalDateTime.now())
                        && s.getCurrentPeriodEnd().isBefore(sevenDaysLater))
                .count();
        long monthlyRevenue = subs.stream()
                .filter(s -> s.getSubscriptionStatus() == SubscriptionStatus.ACTIVE && s.getAmountNpr() != null)
                .mapToLong(Subscription::getAmountNpr)
                .sum();

        return ProSubscriptionStatsDTO.builder()
                .activeCount(activeCount)
                .trialCount(trialCount)
                .expiringSoonCount(expiringSoon)
                .monthlyRevenue(java.math.BigDecimal.valueOf(monthlyRevenue))
                .build();
    }

    @Transactional(readOnly = true)
    public List<ProAdminSubscriptionRowDTO> getProSubscriptions() {
        return subscriptionRepository.findAll().stream()
                .map(this::toProRowResponse)
                .collect(Collectors.toList());
    }

    private ProAdminSubscriptionRowDTO toProRowResponse(Subscription s) {
        return ProAdminSubscriptionRowDTO.builder()
                .workspaceId(s.getWorkspace().getId())
                .organizationName(s.getWorkspace().getOrganization() != null 
                        ? s.getWorkspace().getOrganization().getCompanyName() 
                        : s.getWorkspace().getName())
                .referenceId(s.getReferenceId())
                .planType(s.getPlanType())
                .status(s.getSubscriptionStatus())
                .trialEndsAt(s.getTrialEndsAt())
                .currentPeriodStart(s.getCurrentPeriodStart())
                .currentPeriodEnd(s.getCurrentPeriodEnd())
                .amountNpr(s.getAmountNpr())
                .createdAt(s.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public ProSubscriptionHistoryDTO getProSubscriptionHistory(Long workspaceId) {
        Subscription s = subscriptionRepository.findByWorkspaceId(workspaceId)
                .orElseThrow(() -> new RuntimeException("Subscription not found for workspace: " + workspaceId));
        
        List<ProPaymentTransaction> txs = proPaymentTransactionRepository.findBySubscriptionId(s.getId());
        List<PaymentTransactionResponse> txResponses = txs.stream()
                .map(proPaymentMapper::toResponse)
                .collect(Collectors.toList());

        List<SystemEventDTO> events = new ArrayList<>();
        
        if (s.getCreatedAt() != null) {
            events.add(SystemEventDTO.builder()
                    .id("evt-1")
                    .type("TRIAL_STARTED")
                    .description("14-day Free Trial started automatically.")
                    .createdAt(s.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant())
                    .source("SYSTEM")
                    .build());
        }
        if (s.getCurrentPeriodStart() != null) {
            events.add(SystemEventDTO.builder()
                    .id("evt-2")
                    .type("SUBSCRIPTION_STARTED")
                    .description("Pro subscription activated after successful payment.")
                    .createdAt(s.getCurrentPeriodStart().atZone(java.time.ZoneId.systemDefault()).toInstant())
                    .source("SYSTEM")
                    .build());
        }
        
        return ProSubscriptionHistoryDTO.builder()
                .subscription(toProRowResponse(s))
                .transactions(txResponses)
                .events(events)
                .build();
    }

    @Transactional
    public ProAdminSubscriptionRowDTO cancelProSubscription(Long workspaceId) {
        Subscription sub = subscriptionRepository.findByWorkspaceId(workspaceId)
                .orElseThrow(() -> new RuntimeException("Subscription not found for workspace: " + workspaceId));
        sub.setSubscriptionStatus(SubscriptionStatus.CANCELLED);
        return toProRowResponse(subscriptionRepository.save(sub));
    }

    @Transactional
    public ProAdminSubscriptionRowDTO extendProSubscription(Long workspaceId, int days) {
        Subscription sub = subscriptionRepository.findByWorkspaceId(workspaceId)
                .orElseThrow(() -> new RuntimeException("Subscription not found for workspace: " + workspaceId));
        if (sub.getCurrentPeriodEnd() != null) {
            sub.setCurrentPeriodEnd(sub.getCurrentPeriodEnd().plusDays(days));
        } else {
            sub.setCurrentPeriodEnd(LocalDateTime.now().plusDays(days));
        }
        sub.setSubscriptionStatus(SubscriptionStatus.ACTIVE);
        return toProRowResponse(subscriptionRepository.save(sub));
    }
}
