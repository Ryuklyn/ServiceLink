-- payment_transactions now belongs exclusively to provider_subscriptions.
-- This stale FK was left behind when PaymentTransaction.subscription changed
-- from the B2B Subscription entity to ProviderSubscription. Keeping both FKs
-- makes provider payments fail unless the unrelated tables happen to share IDs.
SET @stale_provider_payment_fk = (
    SELECT CONSTRAINT_NAME
    FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'payment_transactions'
      AND REFERENCED_TABLE_NAME = 'subscriptions'
    LIMIT 1
);
SET @drop_provider_payment_fk_sql = IF(
    @stale_provider_payment_fk IS NULL,
    'SELECT 1',
    CONCAT('ALTER TABLE payment_transactions DROP FOREIGN KEY `', @stale_provider_payment_fk, '`')
);
PREPARE drop_provider_payment_fk FROM @drop_provider_payment_fk_sql;
EXECUTE drop_provider_payment_fk;
DEALLOCATE PREPARE drop_provider_payment_fk;
