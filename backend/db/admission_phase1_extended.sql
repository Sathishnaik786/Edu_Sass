-- Phase 1 Migration: PET Application Support (Internal + External)
-- REQUIRED FOR AUDIT FIX: 
-- Backend logic expects 'candidate_type', 'reference_number', and 'external_applicant_snapshot'.
-- External candidates require 'applicant_id' to be NULLable.
-- This migration aligns the DB schema with the deployed code.

-- 1. Support External Candidates (Make applicant_id optional)
ALTER TABLE admission_applications ALTER COLUMN applicant_id DROP NOT NULL;

-- 2. Add Missing Columns Required by Service Layer
ALTER TABLE admission_applications 
ADD COLUMN IF NOT EXISTS candidate_type VARCHAR(20) DEFAULT 'INTERNAL',
ADD COLUMN IF NOT EXISTS external_applicant_snapshot JSONB,
ADD COLUMN IF NOT EXISTS reference_number VARCHAR(50);

-- 3. Enforce Candidate Type Domain
ALTER TABLE admission_applications DROP CONSTRAINT IF EXISTS check_candidate_type;

ALTER TABLE admission_applications 
ADD CONSTRAINT check_candidate_type CHECK (candidate_type IN ('INTERNAL', 'EXTERNAL'));

-- 4. Ensure Reference Numbers are Unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_admission_applications_ref_no ON admission_applications(reference_number);

-- Index for searching applications by type
CREATE INDEX IF NOT EXISTS idx_admission_applications_type ON admission_applications(application_type);
