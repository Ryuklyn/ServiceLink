package com.servicelink.core.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * One-time compatibility migration for databases created before notification
 * categories became extensible. Hibernate treats MySQL ENUM and VARCHAR as
 * compatible during ddl-auto=update, so it does not reliably migrate the old
 * column by itself.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationSchemaMigration implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        List<String> dataTypes = jdbcTemplate.queryForList("""
                SELECT DATA_TYPE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'notifications'
                  AND COLUMN_NAME = 'category'
                """, String.class);

        if (!dataTypes.isEmpty() && "enum".equalsIgnoreCase(dataTypes.get(0))) {
            jdbcTemplate.execute(
                    "ALTER TABLE notifications MODIFY COLUMN category VARCHAR(32) NOT NULL"
            );
            log.info("Migrated notifications.category from MySQL ENUM to VARCHAR(32)");
        }
    }
}
