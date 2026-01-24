-- Fix missing foreign key relationship for Supabase PostgREST embedding
-- This allows: admission_guide_acceptance (application_id) -> admission_guide_allocations (application_id)

DO $$
BEGIN
    -- Check if constraint exists to avoid errors on re-run
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_admission_guide_acceptance_allocation'
    ) THEN
        ALTER TABLE admission_guide_acceptance
        ADD CONSTRAINT fk_admission_guide_acceptance_allocation
        FOREIGN KEY (application_id)
        REFERENCES admission_guide_allocations (application_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;
END $$;

-- Force PostgREST schema cache reload (Important for Supabase)
NOTIFY pgrst, 'reload schema';
