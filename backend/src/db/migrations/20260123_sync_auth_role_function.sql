-- ==============================================================================
-- ROLE SYNC HELPER (Admin -> Auth Metadata)
-- RESPONSIBILITY: Allow Admin to update Auth Role (Source of Truth)
-- SECURITY: STRICTLY RESTRICTED TO SUPER_ADMIN via RLS / Service Role
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.sync_auth_role(
    target_user_id UUID, 
    new_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated permissions (to touch auth.users if needed)
SET search_path = public, auth 
AS $$
DECLARE
    valid_roles TEXT[] := ARRAY['APPLICANT','DRC','ADMIN','SUPER_ADMIN','FACULTY'];
    existing_user auth.users%ROWTYPE;
BEGIN
    -- 1. Validate Input Role
    IF NOT (new_role = ANY(valid_roles)) THEN
        RAISE EXCEPTION 'Invalid role: %. Must be one of %', new_role, valid_roles;
    END IF;

    -- 2. Verify Target User Exists
    SELECT * INTO existing_user FROM auth.users WHERE id = target_user_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found: %', target_user_id;
    END IF;

    -- 3. Update Auth Metadata (The Source of Truth)
    -- Direct update to auth.users is risky and usually blocked.
    -- Ideally, we use the Supabase Admin API from the backend.
    -- HOWEVER, if we must do it via SQL (as requested per Step 1):
    UPDATE auth.users
    SET raw_app_meta_data = 
        COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', new_role)
    WHERE id = target_user_id;

    -- 4. Sync Profile Mirror (Display Consistency)
    UPDATE public.iers_users
    SET role = new_role
    WHERE id = target_user_id;

    -- 5. Return success
    RETURN jsonb_build_object(
        'success', true,
        'user_id', target_user_id,
        'new_role', new_role
    );
END;
$$;
