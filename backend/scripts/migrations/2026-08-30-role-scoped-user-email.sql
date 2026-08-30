-- Required once for an existing ServiceLink MySQL database.
-- New databases get the same constraint from User.java.
USE servicelink;

-- Find and drop single-column UNIQUE indexes on users.email without assuming
-- Hibernate's generated index name.
SET @drop_email_indexes = (
    SELECT GROUP_CONCAT(CONCAT('DROP INDEX `', index_name, '`') SEPARATOR ', ')
    FROM (
        SELECT index_name
        FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = 'users'
          AND non_unique = 0
          AND index_name <> 'PRIMARY'
        GROUP BY index_name
        HAVING COUNT(*) = 1 AND MAX(column_name) = 'email'
    ) email_indexes
);

SET @alter_sql = IF(
    @drop_email_indexes IS NULL,
    'SELECT ''No global users.email unique index found''',
    CONCAT('ALTER TABLE users ', @drop_email_indexes)
);
PREPARE alter_statement FROM @alter_sql;
EXECUTE alter_statement;
DEALLOCATE PREPARE alter_statement;

SET @has_composite_index = (
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
    ) composite_indexes
);

SET @add_composite_sql = IF(
    @has_composite_index > 0,
    'SELECT ''users(email, role) unique constraint already exists''',
    'ALTER TABLE users ADD CONSTRAINT uk_users_email_role UNIQUE (email, role)'
);
PREPARE composite_statement FROM @add_composite_sql;
EXECUTE composite_statement;
DEALLOCATE PREPARE composite_statement;

