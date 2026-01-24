-- 1. Add missing identity columns (safe if exists)
ALTER TABLE admission_guide_acceptance
ADD COLUMN IF NOT EXISTS applicant_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS guide_id UUID REFERENCES auth.users(id);

-- 2. Backfill applicant_id
UPDATE admission_guide_acceptance aga
SET applicant_id = aa.applicant_id
FROM admission_applications aa
WHERE aga.application_id = aa.id
AND aga.applicant_id IS NULL;

-- 3. Backfill guide_id
UPDATE admission_guide_acceptance aga
SET guide_id = agal.guide_id
FROM admission_guide_allocations agal
WHERE aga.application_id = agal.application_id
AND aga.guide_id IS NULL;

-- 4. Enforce constraints (only if backfill succeeded to avoid errors)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM admission_guide_acceptance WHERE applicant_id IS NOT NULL) THEN
        ALTER TABLE admission_guide_acceptance ALTER COLUMN applicant_id SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM admission_guide_acceptance WHERE guide_id IS NOT NULL) THEN
        ALTER TABLE admission_guide_acceptance ALTER COLUMN guide_id SET NOT NULL;
    END IF;
END $$;

-- 5. Add Index
CREATE INDEX IF NOT EXISTS idx_guide_acceptance_app_id ON admission_guide_acceptance(application_id);

-- 6. RLS Policies
ALTER TABLE admission_guide_acceptance ENABLE ROW LEVEL SECURITY;

-- Drop old policies to be clean
DROP POLICY IF EXISTS "Applicant insert own acceptance" ON admission_guide_acceptance;
DROP POLICY IF EXISTS "Applicant view own acceptance" ON admission_guide_acceptance;
DROP POLICY IF EXISTS "Staff view all acceptance" ON admission_guide_acceptance;
DROP POLICY IF EXISTS "Guide view assigned acceptance" ON admission_guide_acceptance;
DROP POLICY IF EXISTS "Guide update assigned acceptance" ON admission_guide_acceptance;

-- New Strict Policies

-- Applicant: Can view and create their own acceptance
CREATE POLICY "Applicant manage own" ON admission_guide_acceptance
    FOR ALL
    USING (auth.uid() = applicant_id)
    WITH CHECK (auth.uid() = applicant_id);

-- Guide: Can view and update assigned acceptances
CREATE POLICY "Guide manage assigned" ON admission_guide_acceptance
    FOR ALL
    USING (auth.uid() = guide_id)
    WITH CHECK (auth.uid() = guide_id);

-- Admin/DRC: View all
CREATE POLICY "Admin view all" ON admission_guide_acceptance
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM iers_user_roles ur
            JOIN iers_roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() AND r.name IN ('ADMIN', 'SUPER_ADMIN', 'DRC')
        )
    );
