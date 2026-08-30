package com.servicelink.core.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Keeps installations created with the old reasonTag/reasonNote availability
 * model compatible with the current single `reason` field. Hibernate update
 * adds new columns but does not relax obsolete NOT NULL columns, which makes
 * every new exception insert fail even though the entity itself is valid.
 */
@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
@RequiredArgsConstructor
public class AvailabilitySchemaInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        Integer legacyReasonTag = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM information_schema.columns
                WHERE table_schema = DATABASE()
                  AND table_name = 'availability_exceptions'
                  AND column_name = 'reason_tag'
                  AND is_nullable = 'NO'
                """, Integer.class);

        if (legacyReasonTag != null && legacyReasonTag > 0) {
            jdbcTemplate.execute(
                    "ALTER TABLE availability_exceptions MODIFY reason_tag VARCHAR(255) NULL");
            log.info("Relaxed obsolete availability_exceptions.reason_tag constraint");
        }
    }
}
