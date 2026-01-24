-- ==============================================================================
-- SCHEMA REFACTOR: public.iers_users (Backfill & Sync)
-- RESPONSIBILITY: User Profile & Directory (NON-AUTHORITATIVE)
-- DEPENDENCIES: auth.users (Supabase Auth)
-- ==============================================================================

-- 1. Create Profile Table (if not exists)
CREATE TABLE IF NOT EXISTS public.iers_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT, -- MIRROR FIELD ONLY. NOT AUTHORITATIVE.
    full_name TEXT,
    department TEXT,   -- Optional: Academic context
    designation TEXT,  -- Optional: Academic rank
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Explicitly DENY usage as RBAC source
COMMENT ON TABLE public.iers_users IS 
'User Profile/Directory Data ONLY. 
WARNING: NOT A SOURCE OF RBAC AUTHORITY. 
Authorization must use Supabase Auth app_metadata.';

COMMENT ON COLUMN public.iers_users.role IS
'Mirror of auth.users.app_metadata.role. NOT authoritative for RBAC.';

-- 3. Enable RLS (Security Hardening)
ALTER TABLE public.iers_users ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Users view own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.iers_users;
CREATE POLICY "Users can view own profile"
ON public.iers_users
FOR SELECT
USING (auth.uid() = id);

-- 5. RLS Policy: Users update own profile (metadata only)
DROP POLICY IF EXISTS "Users can update own profile" ON public.iers_users;
CREATE POLICY "Users can update own profile"
ON public.iers_users
FOR UPDATE
USING (auth.uid() = id);

-- 6. RLS Policy: Admins/DRC view all profiles (Directory Access)
-- Note: 'role' here refers to the JWT claim (app_metadata), NOT a column in this table.
DROP POLICY IF EXISTS "Start and Admin can view all" ON public.iers_users;
CREATE POLICY "Staff and Admin can view all"
ON public.iers_users
FOR SELECT
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'SUPER_ADMIN', 'DRC', 'FACULTY')
);

-- 7. Trigger to Auto-Create Profile AND Mirror Role on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.iers_users (id, email, full_name, role, created_at, updated_at)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 
    new.raw_app_meta_data->>'role', -- Mirror Role directly from App Metadata
    NOW(), 
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. Backfill existing users (One-time migration)
-- Now includes ROLE mirroring
INSERT INTO public.iers_users (id, email, full_name, role, created_at, updated_at)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)) as full_name,
    raw_app_meta_data->>'role' as role,
    created_at,
    NOW()
FROM auth.users
ON CONFLICT (id) 
DO UPDATE SET role = EXCLUDED.role; -- Ensure existing profiles get role synced

-- 9. Force Sync for existing rows that might have desynced role
UPDATE public.iers_users iu
SET role = u.raw_app_meta_data ->> 'role'
FROM auth.users u
WHERE iu.id = u.id AND iu.role IS DISTINCT FROM (u.raw_app_meta_data ->> 'role');
