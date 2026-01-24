import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { sendResponse } from '../../utils/response';
import { supabase } from '../../lib/supabase';
import { ROLES, Role } from '../../constants/roles';

export const UserAdminController = {
    /**
     * Updates a user's role in Supabase Auth Metadata (Source of Truth)
     * and syncs it to the profile mirror.
     */
    updateUserRole: async (req: AuthRequest, res: Response) => {
        try {
            const { userId } = req.params;
            const { role } = req.body;

            // 1. Validate Input
            if (!userId || !role) {
                return sendResponse(res, 400, false, 'User ID and Role are required');
            }

            if (!Object.values(ROLES).includes(role as Role)) {
                return sendResponse(res, 400, false, `Invalid role. Allowed: ${Object.values(ROLES).join(', ')}`);
            }

            // 2. Perform Update via Supabase Admin API
            // This is the PREFERRED secure method over raw SQL
            const { data, error } = await supabase.auth.admin.updateUserById(userId, {
                app_metadata: { role: role }
            });

            if (error) {
                console.error("Auth Update Failed:", error);
                return sendResponse(res, 500, false, 'Failed to update auth role', null, error.message);
            }

            // 3. Explicitly Sync Profile Mirror (Display consistency)
            const { error: syncError } = await supabase
                .from('iers_users')
                .update({ role: role })
                .eq('id', userId);

            if (syncError) {
                console.warn("Profile Mirror Sync Failed (Non-critical):", syncError);
            }

            // 4. Audit Log
            (req as any).logAudit('ROLE_UPDATED', 'USER', userId, { newRole: role });

            return sendResponse(res, 200, true, `Role updated to ${role} successfully`);

        } catch (error: any) {
            return sendResponse(res, 500, false, 'Internal Server Error', null, error.message);
        }
    }
};
