-- ==============================================================================
-- RLS REPAIR SCRIPT
-- RESPONSIBILITY: Ensure Auth Users can reading their own role mappings.
-- ==============================================================================

-- 1. Ensure RLS is enabled
ALTER TABLE public.iers_user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies to start fresh
DROP POLICY IF EXISTS "users read own roles" ON public.iers_user_roles;
DROP POLICY IF EXISTS "staff read roles" ON public.iers_user_roles;

-- 3. Create Permissive "Read Own" Policy
-- "I can see the row in iers_user_roles where user_id is ME"
CREATE POLICY "users read own roles"
ON public.iers_user_roles
FOR SELECT
USING (
    user_id = auth.uid()
);

-- 4. Create Permissive "Read Profile" Policy
DROP POLICY IF EXISTS "users read own profile" ON public.iers_users;
CREATE POLICY "users read own profile"
ON public.iers_users
FOR SELECT
USING (
    id = auth.uid()
);

-- 5. Force Grant Select (Sometimes needed if Grant was missed)
GRANT SELECT ON public.iers_user_roles TO authenticated;
GRANT SELECT ON public.iers_roles TO authenticated; -- REQUIRED to join/expand naming!
GRANT SELECT ON public.iers_users TO authenticated;
