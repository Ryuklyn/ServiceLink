-- ServiceLink QA inspection queries (read-only, MySQL 8+)
-- Shows a count for every application table, followed by the contents of every
-- non-catalog table. Catalog data is intentionally summarized because it is
-- admin-managed reference data.

SELECT
    table_name,
    table_rows AS estimated_rows
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

DELIMITER $$

DROP PROCEDURE IF EXISTS inspect_servicelink_qa_data$$
CREATE PROCEDURE inspect_servicelink_qa_data()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE table_to_read VARCHAR(64);

    DECLARE tables_to_read CURSOR FOR
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
          AND table_type = 'BASE TABLE'
          AND table_name NOT IN ('categories', 'service_catalog')
        ORDER BY CASE WHEN table_name = 'users' THEN 0 ELSE 1 END, table_name;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    IF DATABASE() <> 'servicelink' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Select the servicelink database first';
    END IF;

    OPEN tables_to_read;
    read_loop: LOOP
        FETCH tables_to_read INTO table_to_read;
        IF done = 1 THEN
            LEAVE read_loop;
        END IF;

        SET @select_sql = CONCAT(
            'SELECT ''', REPLACE(table_to_read, '''', ''''''),
            ''' AS source_table, t.* FROM `',
            REPLACE(table_to_read, '`', '``'), '` t'
        );
        PREPARE select_statement FROM @select_sql;
        EXECUTE select_statement;
        DEALLOCATE PREPARE select_statement;
    END LOOP;
    CLOSE tables_to_read;
END$$

DELIMITER ;

CALL inspect_servicelink_qa_data();
DROP PROCEDURE inspect_servicelink_qa_data;

-- Reference-data summary (services/subservices remain managed by admin).
SELECT c.id, c.name, COUNT(sc.id) AS service_count
FROM categories c
LEFT JOIN service_catalog sc ON sc.category_id = c.id
GROUP BY c.id, c.name
ORDER BY c.name;

