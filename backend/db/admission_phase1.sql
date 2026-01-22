-- Phase 1 Migration: PET Application Support

-- Add application_type and payload to admission_applications
ALTER TABLE admission_applications 
ADD COLUMN IF NOT EXISTS application_type VARCHAR(50) NOT NULL DEFAULT 'PET',
ADD COLUMN IF NOT EXISTS payload JSONB DEFAULT '{}'::jsonb;

-- Add check constraint for application_type
ALTER TABLE admission_applications 
ADD CONSTRAINT check_application_type CHECK (application_type IN ('PET'));

-- Index for searching applications by type
CREATE INDEX IF NOT EXISTS idx_admission_applications_type ON admission_applications(application_type);
