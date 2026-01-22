-- Table: admission_guide_acceptance
CREATE TABLE IF NOT EXISTS admission_guide_acceptance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES admission_applications(id),
    
    student_acceptance BOOLEAN DEFAULT FALSE,
    student_accepted_at TIMESTAMP WITH TIME ZONE,
    
    guide_acceptance BOOLEAN DEFAULT FALSE,
    guide_accepted_at TIMESTAMP WITH TIME ZONE,
    
    remarks TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique index to ensure one acceptance record per application
CREATE UNIQUE INDEX IF NOT EXISTS idx_guide_acceptance_application ON admission_guide_acceptance(application_id);
