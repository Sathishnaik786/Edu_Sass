-- Force Drop to ensure clean schema (Fixes 'column does not exist' if table exists mismatch)
DROP TABLE IF EXISTS admission_guide_allocations CASCADE;

CREATE TABLE admission_guide_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
    
    -- Using applicant_id as requested in specs.
    -- This mirrors the user_id from admission_applications
    applicant_id UUID REFERENCES auth.users(id),
    
    guide_id UUID REFERENCES auth.users(id),
    allocated_by UUID REFERENCES auth.users(id),
    allocation_remarks TEXT,
    allocated_at TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT unique_guide_allocation UNIQUE (application_id)
);

-- RLS Policies
ALTER TABLE admission_guide_allocations ENABLE ROW LEVEL SECURITY;

-- Applicant can view own allocation
CREATE POLICY "Applicant view own guide" 
    ON admission_guide_allocations FOR SELECT 
    USING (auth.uid() = applicant_id);

-- Staff (Admin/DRC/Faculty) can view all
CREATE POLICY "Staff view all allocations" 
    ON admission_guide_allocations FOR SELECT 
    USING (
         EXISTS (
            SELECT 1 FROM iers_user_roles ur
            JOIN iers_roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() AND r.name IN ('ADMIN', 'SUPER_ADMIN', 'DRC', 'FACULTY')
        )
    );

-- DRC/Admin can insert
CREATE POLICY "DRC insert guide allocation" 
    ON admission_guide_allocations FOR INSERT 
    WITH CHECK (
         EXISTS (
            SELECT 1 FROM iers_user_roles ur
            JOIN iers_roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() AND r.name IN ('ADMIN', 'SUPER_ADMIN', 'DRC')
        )
    );
