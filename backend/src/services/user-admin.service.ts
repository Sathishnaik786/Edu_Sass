import { supabase } from '../lib/supabase';
import { ROLES, Role } from '../constants/roles';

// This utility helps seed initial admin/committee users since we don't have a UI for user creation yet.
// Usage: Run explicitly via a script or exposed temporarily to a super-admin route.

export const UserAdminService = {
    createUserWithRole: async (email: string, role: Role, fullName: string) => {
        if (!Object.values(ROLES).includes(role)) {
            throw new Error(`Invalid role: ${role}`);
        }

        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password: 'ChangeMe@1234',
            email_confirm: true,
            app_metadata: { role }, // The Source of Truth for RBAC
            user_metadata: {
                role,
                full_name: fullName
            }
        });

        if (error) throw error;
        return data.user;
    },

    assignRoleToExistingUser: async (userId: string, role: Role) => {
        const { data, error } = await supabase.auth.admin.updateUserById(userId, {
            app_metadata: { role },
            user_metadata: { role } // Keep in sync for frontend
        });

        if (error) throw error;
        return data.user;
    }
};
