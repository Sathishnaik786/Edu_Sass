import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { sendResponse } from '../../utils/response';
import { AnalyticsService } from './analytics.service';

export const AnalyticsController = {
    getStats: async (req: AuthRequest, res: Response) => {
        try {
            const stats = await AnalyticsService.getAdmissionStats();

            // Audit Log
            (req as any).logAudit('VIEW_ADMIN_ANALYTICS', 'ADMISSION_APPLICATION', null);

            return sendResponse(res, 200, true, 'Admin analytics retrieved successfully', stats);
        } catch (error: any) {
            console.error('[ERROR] AnalyticsController.getStats:', error);
            return sendResponse(res, 500, false, 'Failed to retrieve analytics', null, error.message);
        }
    }
};
