-- Phase 3 Migration: PET Interview Scheduling

-- Table: admission_interviews
CREATE TABLE IF NOT EXISTS admission_interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES admission_applications(id),
    interview_date TIMESTAMP WITH TIME ZONE NOT NULL,
    interview_mode VARCHAR(20) NOT NULL CHECK (interview_mode IN ('ONLINE', 'OFFLINE')),
    interview_location TEXT, -- Meeting link or physical venue
    panel_members JSONB, -- Array of strings
    
    created_by UUID NOT NULL, -- DRC User ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure 1:1 relationship
    CONSTRAINT uq_interviews_application_id UNIQUE (application_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_admission_interviews_date ON admission_interviews(interview_date);
