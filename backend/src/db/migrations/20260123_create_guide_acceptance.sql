-- Create table for Guide Acceptance
CREATE TABLE IF NOT EXISTS admission_guide_acceptance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES auth.users(id),
    acceptance_status TEXT NOT NULL CHECK (acceptance_status IN ('ACCEPTED', 'REJECTED')),
    acceptance_remark TEXT,
    accepted_at TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT unique_acceptance_per_app UNIQUE (application_id)
);

-- RLS
ALTER TABLE admission_guide_acceptance ENABLE ROW LEVEL SECURITY;

-- Applicant can insert own record
CREATE POLICY "Applicant insert own acceptance" 
    ON admission_guide_acceptance FOR INSERT 
    WITH CHECK (auth.uid() = applicant_id);

-- Applicant can view own record
CREATE POLICY "Applicant view own acceptance" 
    ON admission_guide_acceptance FOR SELECT 
    USING (auth.uid() = applicant_id);

-- Staff can view all
CREATE POLICY "Staff view all acceptance" 
    ON admission_guide_acceptance FOR SELECT 
    USING (
         EXISTS (
            SELECT 1 FROM iers_user_roles ur
            JOIN iers_roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() AND r.name IN ('ADMIN', 'SUPER_ADMIN', 'DRC', 'FACULTY')
        )
    );
