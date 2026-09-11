package com.servicelink.core;

import com.servicelink.core.model.provider.Provider;
import com.servicelink.core.repository.provider.ProviderRepository;
import com.servicelink.core.service.provider.ProviderInsightsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ProviderEarningsIntegrationTests {

    @Autowired ProviderInsightsService insightsService;
    @Autowired ProviderRepository providerRepository;

    @Test
    void earningsLoadsForActiveProvidersAcrossEverySupportedRange() {
        var providers = providerRepository.findAll().stream()
                .filter(provider -> Boolean.TRUE.equals(provider.getIsActive()))
                .filter(provider -> provider.getUser() != null)
                .toList();
        assumeTrue(!providers.isEmpty());

        for (Provider provider : providers) {
            for (String range : new String[]{"This Week", "This Month", "Last 3 Months", "This Year"}) {
                assertDoesNotThrow(() -> insightsService.getEarnings(provider.getUser().getId(), range));
            }
        }
    }
}
