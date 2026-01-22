-- Phase 5 Migration: Document Verification

-- Table: admission_document_verifications
CREATE TABLE IF NOT EXISTS admission_document_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES admission_applications(id),
    
    verification_status VARCHAR(20) NOT NULL CHECK (verification_status IN ('VERIFIED', 'REJECTED')),
    remarks TEXT,
    
    verified_by UUID NOT NULL, -- ADMIN or DRC User ID
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure 1:1 relationship
    CONSTRAINT uq_doc_verif_app_id UNIQUE (application_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_admission_doc_verif_app ON admission_document_verifications(application_id);
