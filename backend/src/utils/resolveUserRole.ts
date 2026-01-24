import { supabase } from '../lib/supabase';

// Resolves a user's role strictly from the database
export const resolveUserRole = async (userId: string): Promise<string | null> => {
    try {
        const { data, error } = await supabase
            .from('iers_user_roles')
            .select('iers_roles(name)')
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            // It's possible a user has no role yet (new applicant potentially)
            // Or query failed.
            return null;
        }

        // @ts-ignore - Supabase type inference for joined tables can be tricky
        return data.iers_roles?.name || null;
    } catch (err) {
        console.error('Role Resolution Error:', err);
        return null;
    }
};
