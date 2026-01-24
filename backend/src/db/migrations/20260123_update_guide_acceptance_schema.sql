-- Add missing columns to admission_guide_acceptance
ALTER TABLE admission_guide_acceptance 
ADD COLUMN IF NOT EXISTS student_acceptance BOOLEAN,
ADD COLUMN IF NOT EXISTS student_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS guide_acceptance BOOLEAN,
ADD COLUMN IF NOT EXISTS guide_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS remarks TEXT;
