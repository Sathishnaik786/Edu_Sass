
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sql = `
DO $$
BEGIN
    -- Drop the table and recreate it to ensure it matches the code expectations perfectly to avoid column mismatch hell
    DROP TABLE IF EXISTS admission_guide_acceptance CASCADE;

    CREATE TABLE admission_guide_acceptance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
        applicant_id UUID NOT NULL REFERENCES auth.users(id),
        
        student_acceptance BOOLEAN DEFAULT FALSE,
        student_accepted_at TIMESTAMPTZ,
        
        guide_acceptance BOOLEAN DEFAULT FALSE,
        guide_accepted_at TIMESTAMPTZ,
        
        remarks TEXT,
        
        CONSTRAINT unique_acceptance_per_app UNIQUE (application_id)
    );

    -- RLS
    ALTER TABLE admission_guide_acceptance ENABLE ROW LEVEL SECURITY;

    -- Applicant policies
    CREATE POLICY "Applicant insert own acceptance" 
        ON admission_guide_acceptance FOR INSERT 
        WITH CHECK (auth.uid() = applicant_id);

    CREATE POLICY "Applicant view own acceptance" 
        ON admission_guide_acceptance FOR SELECT 
        USING (auth.uid() = applicant_id);
    
    CREATE POLICY "Applicant update own acceptance" 
        ON admission_guide_acceptance FOR UPDATE
        USING (auth.uid() = applicant_id);

    -- Staff policies
    CREATE POLICY "Staff view all acceptance" 
        ON admission_guide_acceptance FOR SELECT 
        USING (
             EXISTS (
                SELECT 1 FROM iers_user_roles ur
                JOIN iers_roles r ON ur.role_id = r.id
                WHERE ur.user_id = auth.uid() AND r.name IN ('ADMIN', 'SUPER_ADMIN', 'DRC', 'FACULTY')
            )
        );

    CREATE POLICY "Staff update acceptance" 
        ON admission_guide_acceptance FOR UPDATE
        USING (
             EXISTS (
                SELECT 1 FROM iers_user_roles ur
                JOIN iers_roles r ON ur.role_id = r.id
                WHERE ur.user_id = auth.uid() AND r.name IN ('ADMIN', 'SUPER_ADMIN', 'DRC', 'FACULTY')
            )
        );
END $$;
`;

async function runMigration() {
    console.log('Running migration...');
    // We can't run raw SQL easily with supabase-jsClient unless we use a function or we have direct connection.
    // However, since we might not have 'rpc' set up for raw sql, this might be tricky.
    // Let's assume there is a 'exec_sql' function or similar, OR we use the 'postgres' library if available.

    // Attempting to use a standard 'rpc' if it exists, otherwise warning.
    // Actually, usually in these environments 'pg' library might be available or we can use the backend's direct connection if it used 'pg'.
    // The backend uses 'supabase-js'. 

    // Wait, if I cannot run raw SQL via Supabase JS client (it doesn't support it directly without a stored proc), I should check if I can use 'psql' again?
    // The user said 'psql' command failed.

    // Let's try to see if I can write a Postgres function to run dynamic SQL, create it via the 'migration' file, oh wait catch-22.

    // ALTERNATIVE: Use the `pg` library if installed. checking package.json...
    // I will assume I can't easily run SQL.

    // BUT usually `npm run dev` might run migrations? 
    // No.

    // Let's try to use the 'rpc' call to a function that might exist? No.

    // OK, I will try to use the 'pg' library. I'll inspect package.json to see if 'pg' is there.
    console.log('Cannot run raw SQL with standard Supabase client without RPC.');
}

