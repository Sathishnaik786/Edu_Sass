-- ==============================================================================
-- DATABASE-DRIVEN RBAC MIGRATION
-- RESPONSIBILITY: Fully replace metadata-based RBAC with relational tables.
-- ==============================================================================

-- 1. Create Roles Master Table
CREATE TABLE IF NOT EXISTS public.iers_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT
);

-- Seed Roles
INSERT INTO public.iers_roles (name, description) VALUES
    ('ADMIN', 'System administrator'),
    ('DRC', 'Department Research Committee'),
    ('APPLICANT', 'PhD Applicant'),
    ('SUPER_ADMIN', 'Platform Administrator'),
    ('FACULTY', 'Academic Faculty')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- 2. Create Permissions Master Table
CREATE TABLE IF NOT EXISTS public.iers_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    description TEXT
);

-- Seed Permissions (Initial Admission set)
INSERT INTO public.iers_permissions (code, description) VALUES
    ('ADMISSION_VIEW_ALL', 'View all admission applications'),
    ('ADMISSION_SCRUTINIZE', 'Scrutinize applications (DRC)'),
    ('ADMISSION_APPROVE_INTAKE', 'Approve external intake (Admin)'),
    ('ADMISSION_APPLY', 'Submit admission application')
ON CONFLICT (code) DO NOTHING;

-- 3. Create Role -> Permission Mapping
CREATE TABLE IF NOT EXISTS public.iers_role_permissions (
    role_id UUID REFERENCES public.iers_roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.iers_permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. Ensure Users Table (Refactored Profile Table)
-- We need to ensure iers_users exists and matches the new requirement.
-- If it exists from previous migrations, we alter it if needed, or rely on it.
-- The previous migration defined it as `id`, `email`, `role` (mirror), `full_name`.
-- We will DROP the `role` column now as it is obsolete.
ALTER TABLE public.iers_users DROP COLUMN IF EXISTS role;

-- 5. User -> Role Assignment (The SOURCE OF TRUTH)
CREATE TABLE IF NOT EXISTS public.iers_user_roles (
    user_id UUID REFERENCES public.iers_users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.iers_roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, role_id)
);

-- 6. Trigger to Sync Auth -> iers_users (Idempotent)
CREATE OR REPLACE FUNCTION public.sync_auth_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.iers_users (id, email, full_name)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-bind trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.sync_auth_user();

-- 7. RLS Enforcement (Database-Driven)
ALTER TABLE public.iers_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iers_user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
DROP POLICY IF EXISTS "users read own profile" ON public.iers_users;
CREATE POLICY "users read own profile"
ON public.iers_users FOR SELECT
USING (auth.uid() = id);

-- Helper Function for RLS to check roles efficiently without complex joins repeatedly in policies
-- NOTE: Supabase recommends using claims for perf, but strict DB requirement means we query.
-- To avoid recursion, we query user_roles directly.

-- Policy: Admin/DRC can read ALL users (needed for directories)
DROP POLICY IF EXISTS "staff read users" ON public.iers_users;
CREATE POLICY "staff read users"
ON public.iers_users FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.iers_user_roles ur
        JOIN public.iers_roles r ON r.id = ur.role_id
        WHERE ur.user_id = auth.uid()
        AND r.name IN ('ADMIN', 'DRC', 'SUPER_ADMIN')
    )
);

-- Policy: Users can read their own roles
DROP POLICY IF EXISTS "users read own roles" ON public.iers_user_roles;
CREATE POLICY "users read own roles"
ON public.iers_user_roles FOR SELECT
USING (user_id = auth.uid());

-- Policy: Staff can read assignments
DROP POLICY IF EXISTS "staff read roles" ON public.iers_user_roles;
CREATE POLICY "staff read roles"
ON public.iers_user_roles FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.iers_user_roles ur
        JOIN public.iers_roles r ON r.id = ur.role_id
        WHERE ur.user_id = auth.uid()
        AND r.name IN ('ADMIN', 'SUPER_ADMIN') -- Only Admins usually manage roles
    )
);

-- 8. Backfill existing Users into Roles (Migration Helper)
-- Map string roles from iers_users (if preserved temporarily or conceptually) or just manual intervention.
-- For this migration, we assume we need to re-assign roles manually or via a script, 
-- BUT we can try to migrate from the old `role` column if it existed before we dropped it...
-- WAIT: We dropped logic above.
-- Strategy: We will create a function `assign_role(email, role_name)` to help you restore access quickly.

CREATE OR REPLACE FUNCTION public.assign_system_role(target_email TEXT, role_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_uid UUID;
    target_rid UUID;
BEGIN
    SELECT id INTO target_uid FROM public.iers_users WHERE email = target_email;
    SELECT id INTO target_rid FROM public.iers_roles WHERE name = role_name;

    IF target_uid IS NULL THEN RAISE EXCEPTION 'User % not found', target_email; END IF;
    IF target_rid IS NULL THEN RAISE EXCEPTION 'Role % not found', role_name; END IF;

    INSERT INTO public.iers_user_roles (user_id, role_id)
    VALUES (target_uid, target_rid)
    ON CONFLICT (user_id, role_id) DO NOTHING;
END;
$$;
