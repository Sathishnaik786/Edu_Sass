-- Add verification columns to fee_payments table
-- SAFE Extension: Only adds columns if they don't exist

ALTER TABLE admission_fee_payments 
ADD COLUMN IF NOT EXISTS verified_by UUID,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_remark TEXT;
