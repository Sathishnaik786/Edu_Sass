-- Phase 7 Migration: Guide Allocation

-- Table: admission_guide_allocations
CREATE TABLE IF NOT EXISTS admission_guide_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES admission_applications(id),
    
    guide_faculty_id VARCHAR(255) NOT NULL, -- Assuming Faculty ID is string/UUID from another module users table
    allocated_by UUID NOT NULL, -- DRC or Admin User ID
    
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure 1:1 relationship
    CONSTRAINT uq_guide_allocation_app_id UNIQUE (application_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_admission_guide_app ON admission_guide_allocations(application_id);
