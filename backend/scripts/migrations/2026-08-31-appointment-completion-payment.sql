ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS service_payment_status VARCHAR(20) NULL,
    ADD COLUMN IF NOT EXISTS service_payment_method VARCHAR(20) NULL,
    ADD COLUMN IF NOT EXISTS completion_note TEXT NULL,
    ADD COLUMN IF NOT EXISTS selected_services_json TEXT NULL,
    ADD COLUMN IF NOT EXISTS completed_services_json TEXT NULL;
