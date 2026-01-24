import { supabase } from '../lib/supabase';
import { ROLES, Role } from '../constants/roles';

export const UserRoleSyncService = {
    /**
     * Syncs a user's role from Supabase Auth metadata to the read-only iers_users profile table.
     * This ensures the UI always has access to the user's role without needing expensive auth calls.
     * @param userId The UUID of the user to sync
     */
    syncUserRole: async (userId: string) => {
        // 1. Fetch source of truth (Auth User)
        // Access via admin api to get raw_app_meta_data
        const { data: { user }, error: fetchError } = await supabase.auth.admin.getUserById(userId);

        if (fetchError || !user) {
            console.error(`[ROLE_SYNC] Failed to fetch user ${userId}:`, fetchError);
            return;
        }

        const authRole = user.app_metadata.role as Role | undefined;

        if (!authRole) {
            console.warn(`[ROLE_SYNC] User ${userId} has no role in app_metadata.`);
            return;
        }

        // 2. Sync to Profile Mirror
        const { error: updateError } = await supabase
            .from('iers_users')
            .update({ role: authRole })
            .eq('id', userId);

        if (updateError) {
            console.error(`[ROLE_SYNC] Failed to update profile for ${userId}:`, updateError);
        } else {
            console.log(`[ROLE_SYNC] Successfully synced role '${authRole}' for user ${userId}`);
        }
    }
};
