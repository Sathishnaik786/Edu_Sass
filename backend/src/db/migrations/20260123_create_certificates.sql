-- Create table for Guide Allocation Certificates
CREATE TABLE IF NOT EXISTS admission_allocation_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
    certificate_number TEXT NOT NULL UNIQUE,
    certificate_url TEXT, -- Can be null initially if async generation
    generated_by UUID REFERENCES auth.users(id),
    generated_at TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT unique_certificate_per_app UNIQUE (application_id)
);

-- RLS
ALTER TABLE admission_allocation_certificates ENABLE ROW LEVEL SECURITY;

-- Applicant can view their own certificate
CREATE POLICY "Applicant view own certificate" 
    ON admission_allocation_certificates FOR SELECT 
    USING (
         EXISTS (
            SELECT 1 FROM admission_applications a
            WHERE a.id = admission_allocation_certificates.application_id
            -- Check user definition in admission_applications. Usually applicant_id or user_id internal column
            AND (a.applicant_id = auth.uid()) -- Assuming applicant_id column is used
        )
    );

-- Staff can view all
CREATE POLICY "Staff view all certificates" 
    ON admission_allocation_certificates FOR SELECT 
    USING (
         EXISTS (
            SELECT 1 FROM iers_user_roles ur
            JOIN iers_roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() AND r.name IN ('ADMIN', 'SUPER_ADMIN', 'DRC', 'FACULTY')
        )
    );

-- Admin/DRC can Insert
CREATE POLICY "Admin insert certificate" 
    ON admission_allocation_certificates FOR INSERT 
    WITH CHECK (
         EXISTS (
            SELECT 1 FROM iers_user_roles ur
            JOIN iers_roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() AND r.name IN ('ADMIN', 'SUPER_ADMIN', 'DRC')
        )
    );
