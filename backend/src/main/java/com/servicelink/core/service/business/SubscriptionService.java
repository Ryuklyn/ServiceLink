package com.servicelink.core.service.business;

import com.servicelink.core.dto.request.business.SubscriptionRequest;
import com.servicelink.core.dto.response.business.SubscriptionResponse;
import com.servicelink.core.model.business.Subscription;
import com.servicelink.core.model.business.Workspace;
import com.servicelink.core.repository.business.SubscriptionRepository;
import com.servicelink.core.repository.business.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final WorkspaceRepository workspaceRepository;

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

        return toResponse(subscriptionRepository.save(sub));
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
}
