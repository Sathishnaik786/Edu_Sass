-- Phase 4 Migration: PET Interview Evaluation

-- Table: admission_interview_evaluations
CREATE TABLE IF NOT EXISTS admission_interview_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID NOT NULL REFERENCES admission_interviews(id),
    application_id UUID NOT NULL REFERENCES admission_applications(id),
    evaluation_score NUMERIC(5, 2), -- Score out of 100 or 10, etc.
    recommendation VARCHAR(20) NOT NULL CHECK (recommendation IN ('PASS', 'FAIL')),
    remarks TEXT,
    
    evaluated_by UUID NOT NULL, -- DRC User ID
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure 1:1 relationship per interview
    CONSTRAINT uq_evaluations_interview_id UNIQUE (interview_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_admission_evaluations_app ON admission_interview_evaluations(application_id);
