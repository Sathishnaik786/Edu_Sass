-- Table: admission_allocation_certificates
CREATE TABLE IF NOT EXISTS admission_allocation_certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES admission_applications(id),
    certificate_number VARCHAR(100) NOT NULL UNIQUE,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    issued_by UUID, -- references auth.users
    file_url TEXT NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique index to ensure one certificate per application
CREATE UNIQUE INDEX IF NOT EXISTS idx_allocation_cert_application ON admission_allocation_certificates(application_id);
