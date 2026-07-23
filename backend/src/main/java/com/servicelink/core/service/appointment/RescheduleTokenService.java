package com.servicelink.core.service.appointment;

import com.servicelink.core.dto.response.appointment.RescheduleTokenBalanceDTO;
import com.servicelink.core.exception.BusinessException;
import com.servicelink.core.model.appointment.RescheduleToken;
import com.servicelink.core.repository.appointment.RescheduleTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;

@Slf4j
@Service
@RequiredArgsConstructor
public class RescheduleTokenService {

    /** Tokens granted per customer per calendar year. Adjust here if the business rule changes. */
    private static final int DEFAULT_TOKENS_PER_YEAR = 3;

    private final RescheduleTokenRepository tokenRepo;

    @Transactional
    public RescheduleToken getOrCreateForYear(Long customerId, int year) {
        return tokenRepo.findByCustomerIdAndYear(customerId, year)
                .orElseGet(() -> {
                    RescheduleToken created = RescheduleToken.builder()
                            .customerId(customerId)
                            .year(year)
                            .tokensTotal(DEFAULT_TOKENS_PER_YEAR)
                            .tokensUsed(0)
                            .build();
                    log.info("Creating {} reschedule tokens for customer {} for year {}",
                            DEFAULT_TOKENS_PER_YEAR, customerId, year);
                    return tokenRepo.save(created);
                });
    }

    @Transactional(readOnly = true)
    public RescheduleTokenBalanceDTO getBalance(Long customerId) {
        int year = Year.now().getValue();
        RescheduleToken token = getOrCreateForYear(customerId, year);
        return toBalanceDTO(token);
    }

    /**
     * Spends 1 token for the current year. Locks the row for the duration of
     * the transaction so two simultaneous reschedule requests can't both
     * succeed off a stale "1 remaining" read.
     */
    @Transactional
    public RescheduleToken useToken(Long customerId) {
        int year = Year.now().getValue();

        // Ensure the row exists first (outside the lock — creation itself doesn't need it).
        getOrCreateForYear(customerId, year);

        RescheduleToken token = tokenRepo.findByCustomerIdAndYearForUpdate(customerId, year)
                .orElseThrow(() -> new IllegalStateException(
                        "Reschedule token row disappeared for customer " + customerId + " year " + year));

        if (!token.hasTokenAvailable()) {
            throw new BusinessException(
                    "No reschedule tokens remaining for " + year, "NO_TOKENS_REMAINING");
        }

        token.setTokensUsed(token.getTokensUsed() + 1);
        RescheduleToken saved = tokenRepo.save(token);
        log.info("Customer {} used 1 reschedule token \u2014 {} of {} used ({})",
                customerId, saved.getTokensUsed(), saved.getTokensTotal(), year);
        return saved;
    }

    private RescheduleTokenBalanceDTO toBalanceDTO(RescheduleToken token) {
        return RescheduleTokenBalanceDTO.builder()
                .year(token.getYear())
                .tokensTotal(token.getTokensTotal())
                .tokensUsed(token.getTokensUsed())
                .tokensRemaining(token.getRemaining())
                .build();
    }
}