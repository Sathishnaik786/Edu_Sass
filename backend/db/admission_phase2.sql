-- Phase 2 Migration: PET Scrutiny

-- Table: admission_scrutiny_reviews
CREATE TABLE IF NOT EXISTS admission_scrutiny_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES admission_applications(id),
    reviewed_by UUID NOT NULL, -- references auth.users normally
    decision VARCHAR(50) NOT NULL CHECK (decision IN ('APPROVE', 'REJECT')),
    remarks TEXT,
    
    -- Timestamps
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying reviews by application
CREATE INDEX IF NOT EXISTS idx_scrutiny_reviews_app_id ON admission_scrutiny_reviews(application_id);
