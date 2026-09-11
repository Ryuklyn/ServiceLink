package com.servicelink.core.service.appointment;

import com.servicelink.core.dto.response.appointment.CancellationTokenBalanceDTO;
import com.servicelink.core.exception.BusinessException;
import com.servicelink.core.model.appointment.CancellationToken;
import com.servicelink.core.repository.appointment.CancellationTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;

@Slf4j
@Service
@RequiredArgsConstructor
public class CancellationTokenService {

    /** Tokens granted per customer per calendar year. Adjust here if the business rule changes. */
    private static final int DEFAULT_TOKENS_PER_YEAR = 2;

    private final CancellationTokenRepository tokenRepo;

    @Transactional
    public CancellationToken getOrCreateForYear(Long customerId, int year) {
        return tokenRepo.findByCustomerIdAndYear(customerId, year)
                .orElseGet(() -> {
                    CancellationToken created = CancellationToken.builder()
                            .customerId(customerId)
                            .year(year)
                            .tokensTotal(DEFAULT_TOKENS_PER_YEAR)
                            .tokensUsed(0)
                            .build();
                    log.info("Creating {} cancellation tokens for customer {} for year {}",
                            DEFAULT_TOKENS_PER_YEAR, customerId, year);
                    return tokenRepo.save(created);
                });
    }

    @Transactional(readOnly = true)
    public CancellationTokenBalanceDTO getBalance(Long customerId) {
        int year = Year.now().getValue();
        CancellationToken token = getOrCreateForYear(customerId, year);
        return toBalanceDTO(token);
    }

    /**
     * Spends 1 token for the current year. Locks the row for the duration of
     * the transaction so two simultaneous cancellation requests can't both
     * succeed off a stale "1 remaining" read.
     */
    @Transactional
    public CancellationToken useToken(Long customerId) {
        int year = Year.now().getValue();

        // Ensure the row exists first (outside the lock).
        getOrCreateForYear(customerId, year);

        CancellationToken token = tokenRepo.findByCustomerIdAndYearForUpdate(customerId, year)
                .orElseThrow(() -> new IllegalStateException(
                        "Cancellation token row disappeared for customer " + customerId + " year " + year));

        if (!token.hasTokenAvailable()) {
            throw new BusinessException(
                    "No cancellation tokens remaining for " + year, "NO_TOKENS_REMAINING");
        }

        token.setTokensUsed(token.getTokensUsed() + 1);
        CancellationToken saved = tokenRepo.save(token);
        log.info("Customer {} used 1 cancellation token — {} of {} used ({})",
                customerId, saved.getTokensUsed(), saved.getTokensTotal(), year);
        return saved;
    }

    private CancellationTokenBalanceDTO toBalanceDTO(CancellationToken token) {
        return CancellationTokenBalanceDTO.builder()
                .year(token.getYear())
                .tokensTotal(token.getTokensTotal())
                .tokensUsed(token.getTokensUsed())
                .tokensRemaining(token.getRemaining())
                .build();
    }
}
