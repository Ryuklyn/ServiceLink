-- ServiceLink QA reset (MySQL 8+)
-- Keeps:
--   1. every ADMIN row in users
--   2. categories
--   3. service_catalog (the admin-managed services/subservices)
-- Deletes every other application's table data.
--
-- Run from the `servicelink` database only. The explicit flag is intentional:
--   SET @allow_qa_reset = 1;
--   SOURCE backend/scripts/qa/reset-qa-data.sql;

DELIMITER $$

DROP PROCEDURE IF EXISTS reset_servicelink_qa_data$$
CREATE PROCEDURE reset_servicelink_qa_data()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE table_to_clear VARCHAR(64);
    DECLARE has_auto_increment BOOLEAN;
    DECLARE previous_fk_checks INT DEFAULT 1;

    DECLARE tables_to_clear CURSOR FOR
        SELECT t.table_name,
               EXISTS (
                   SELECT 1
                   FROM information_schema.columns c
                   WHERE c.table_schema = t.table_schema
                     AND c.table_name = t.table_name
                     AND c.extra LIKE '%auto_increment%'
               ) AS has_auto_increment
        FROM information_schema.tables t
        WHERE t.table_schema = DATABASE()
          AND t.table_type = 'BASE TABLE'
          AND t.table_name NOT IN ('users', 'categories', 'service_catalog')
        ORDER BY t.table_name;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET FOREIGN_KEY_CHECKS = previous_fk_checks;
        RESIGNAL;
    END;

    IF DATABASE() <> 'servicelink' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Refusing reset: select the servicelink database first';
    END IF;

    IF COALESCE(@allow_qa_reset, 0) <> 1 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Refusing reset: run SET @allow_qa_reset = 1 first';
    END IF;

    SET previous_fk_checks = @@FOREIGN_KEY_CHECKS;
    SET FOREIGN_KEY_CHECKS = 0;

    OPEN tables_to_clear;
    clear_loop: LOOP
        FETCH tables_to_clear INTO table_to_clear, has_auto_increment;
        IF done = 1 THEN
            LEAVE clear_loop;
        END IF;

        SET @delete_sql = CONCAT('DELETE FROM `', REPLACE(table_to_clear, '`', '``'), '`');
        PREPARE delete_statement FROM @delete_sql;
        EXECUTE delete_statement;
        DEALLOCATE PREPARE delete_statement;

        IF has_auto_increment THEN
            SET @increment_sql = CONCAT(
                'ALTER TABLE `', REPLACE(table_to_clear, '`', '``'), '` AUTO_INCREMENT = 1'
            );
            PREPARE increment_statement FROM @increment_sql;
            EXECUTE increment_statement;
            DEALLOCATE PREPARE increment_statement;
        END IF;
    END LOOP;
    CLOSE tables_to_clear;

    -- Preserve admin login(s), but remove customers, providers and business users.
    DELETE FROM users
    WHERE role IS NULL OR UPPER(role) <> 'ADMIN';

    SET FOREIGN_KEY_CHECKS = previous_fk_checks;
    SET @allow_qa_reset = 0;
END$$

DELIMITER ;

CALL reset_servicelink_qa_data();
DROP PROCEDURE reset_servicelink_qa_data;

-- Immediate proof of what was preserved.
SELECT id, email, role FROM users ORDER BY id;
SELECT COUNT(*) AS category_count FROM categories;
SELECT COUNT(*) AS service_and_subservice_count FROM service_catalog;
