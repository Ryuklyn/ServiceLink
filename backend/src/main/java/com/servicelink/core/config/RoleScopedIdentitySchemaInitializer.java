package com.servicelink.core.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Bridges existing databases from globally unique users.email to the
 * role-scoped identity model. Hibernate ddl-auto=update can add the new
 * composite key, but it does not reliably remove the obsolete unique index.
 */
@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
public class RoleScopedIdentitySchemaInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        List<String> globalEmailIndexes = jdbcTemplate.queryForList("""
                SELECT index_name
                FROM information_schema.statistics
                WHERE table_schema = DATABASE()
                  AND table_name = 'users'
                  AND non_unique = 0
                  AND index_name <> 'PRIMARY'
                GROUP BY index_name
                HAVING COUNT(*) = 1 AND MAX(column_name) = 'email'
                """, String.class);

        for (String indexName : globalEmailIndexes) {
            jdbcTemplate.execute("ALTER TABLE users DROP INDEX `" + quoteIdentifier(indexName) + "`");
            log.info("Removed obsolete global users.email unique index [{}]", indexName);
        }

        Integer compositeIndexes = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM (
                    SELECT index_name
                    FROM information_schema.statistics
                    WHERE table_schema = DATABASE()
                      AND table_name = 'users'
                      AND non_unique = 0
                      AND column_name IN ('email', 'role')
                    GROUP BY index_name
                    HAVING COUNT(*) = 2
                ) role_scoped_indexes
                """, Integer.class);

        if (compositeIndexes == null || compositeIndexes == 0) {
            jdbcTemplate.execute(
                    "ALTER TABLE users ADD CONSTRAINT uk_users_email_role UNIQUE (email, role)");
            log.info("Added role-scoped users(email, role) unique constraint");
        }
    }

    private String quoteIdentifier(String identifier) {
        return identifier.replace("`", "``");
    }
}
