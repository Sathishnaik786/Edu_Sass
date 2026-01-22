-- Phase 6 Migration: Admission Fee Payment

-- Table: admission_fee_payments
CREATE TABLE IF NOT EXISTS admission_fee_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES admission_applications(id),
    
    amount NUMERIC(10, 2) NOT NULL,
    payment_reference VARCHAR(100), -- Transaction ID or Receipt No
    payment_status VARCHAR(20) NOT NULL CHECK (payment_status IN ('PAID', 'FAILED')),
    payment_mode VARCHAR(20) NOT NULL CHECK (payment_mode IN ('ONLINE', 'OFFLINE')),
    
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recorded_by UUID, -- System (null) or Admin User ID

    -- Ensure 1:1 relationship
    CONSTRAINT uq_fee_payment_app_id UNIQUE (application_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_admission_fee_app ON admission_fee_payments(application_id);
