import { supabase } from '../../lib/supabase';
import { ADMISSION_STATUS, CANDIDATE_TYPE } from './admission.constants';

export const AnalyticsService = {
    getAdmissionStats: async () => {
        const now = new Date();
        const startOfToday = new Date(now.setHours(0, 0, 0, 0)).toISOString();

        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const startOfLastWeek = lastWeek.toISOString();

        // 1. Total Applications (HEAD request is highly efficient)
        const { count: totalApplications, error: errTotal } = await supabase
            .from('admission_applications')
            .select('*', { count: 'exact', head: true })
            .is('deleted_at', null);

        if (errTotal) throw errTotal;

        // 2. Count by Status - Using separate HEAD requests to guarantee DB aggregation
        const statusKeys = Object.values(ADMISSION_STATUS);
        const countByStatus: Record<string, number> = {};

        await Promise.all(statusKeys.map(async (status) => {
            const { count } = await supabase
                .from('admission_applications')
                .select('*', { count: 'exact', head: true })
                .eq('status', status)
                .is('deleted_at', null);
            countByStatus[status] = count || 0;
        }));

        // 3. Count by Application Type
        const typeKeys = Object.values(CANDIDATE_TYPE);
        const countByApplicationType: Record<string, number> = {};

        await Promise.all(typeKeys.map(async (type) => {
            const { count } = await supabase
                .from('admission_applications')
                .select('*', { count: 'exact', head: true })
                .eq('candidate_type', type)
                .is('deleted_at', null);
            countByApplicationType[type] = count || 0;
        }));

        // 4. Submissions Today
        const { count: submissionsToday, error: errToday } = await supabase
            .from('admission_applications')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startOfToday)
            .is('deleted_at', null);

        if (errToday) throw errToday;

        // 5. Submissions This Week
        const { count: submissionsThisWeek, error: errWeek } = await supabase
            .from('admission_applications')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startOfLastWeek)
            .is('deleted_at', null);

        if (errWeek) throw errWeek;

        return {
            totalApplications: totalApplications || 0,
            countByStatus,
            countByApplicationType,
            submissionsToday: submissionsToday || 0,
            submissionsThisWeek: submissionsThisWeek || 0
        };
    }
};
