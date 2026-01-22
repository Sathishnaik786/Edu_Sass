-- Table: admission_pet_exemptions
CREATE TABLE IF NOT EXISTS admission_pet_exemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES admission_applications(id),
    exemption_reason TEXT NOT NULL,
    supporting_documents JSONB DEFAULT '[]',
    requested_by UUID NOT NULL, -- references auth.users
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewed_by UUID, -- references auth.users
    reviewed_at TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique constraint: Only one exemption request per application
CREATE UNIQUE INDEX IF NOT EXISTS idx_pet_exemption_application_one_per_app ON admission_pet_exemptions(application_id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_pet_exemption_status ON admission_pet_exemptions(status);
