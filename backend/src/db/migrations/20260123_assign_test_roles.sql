-- ==============================================================================
-- ASSIGN TEST ROLES (FIX)
-- RESPONSIBILITY: Ensure admin@test.com and drc@test.com have DB roles.
-- ==============================================================================

-- We use the helper function created in the previous migration.
-- Note: User IDs must exist in auth.users AND iers_users.
-- The triggers should have handled iers_users creation.

-- Assign ADMIN Role
SELECT public.assign_system_role('admin@test.com', 'ADMIN');

-- Assign DRC Role
SELECT public.assign_system_role('drc@test.com', 'DRC');

-- Verify (Output for manual check if run in editor)
/*
SELECT u.email, r.name as assigned_role
FROM public.iers_user_roles ur
JOIN public.iers_users u ON u.id = ur.user_id
JOIN public.iers_roles r ON r.id = ur.role_id;
*/
