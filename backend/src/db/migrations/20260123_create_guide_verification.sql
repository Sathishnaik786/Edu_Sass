-- Create table for Guide Verification (Faculty Confirmation)
CREATE TABLE IF NOT EXISTS admission_guide_verification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
    guide_id UUID NOT NULL REFERENCES auth.users(id),
    verification_status TEXT NOT NULL CHECK (verification_status IN ('VERIFIED', 'REJECTED')),
    verification_remark TEXT,
    verified_at TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT unique_guide_verification UNIQUE (application_id)
);

-- RLS
ALTER TABLE admission_guide_verification ENABLE ROW LEVEL SECURITY;

-- Guide can insert/view own record
CREATE POLICY "Guide insert own verification" 
    ON admission_guide_verification FOR INSERT 
    WITH CHECK (auth.uid() = guide_id);

CREATE POLICY "Guide view own verification" 
    ON admission_guide_verification FOR SELECT 
    USING (auth.uid() = guide_id);

-- Staff (Admin/DRC) can view all
CREATE POLICY "Staff view all verifications" 
    ON admission_guide_verification FOR SELECT 
    USING (
         EXISTS (
            SELECT 1 FROM iers_user_roles ur
            JOIN iers_roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() AND r.name IN ('ADMIN', 'SUPER_ADMIN', 'DRC')
        )
    );

-- Applicant can view own verification
CREATE POLICY "Applicant view own verification" 
    ON admission_guide_verification FOR SELECT 
    USING (
         EXISTS (
            SELECT 1 FROM admission_applications a
            WHERE a.id = admission_guide_verification.application_id
            AND a.applicant_id = auth.uid() -- Using robust logic in app if needed
        )
    );
