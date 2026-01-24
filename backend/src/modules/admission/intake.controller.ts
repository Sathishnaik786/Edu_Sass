import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { sendResponse } from '../../utils/response';
import { IntakeService } from './intake.service';

export const IntakeController = {
    getPendingIntake: async (req: AuthRequest, res: Response) => {
        try {
            const result = await IntakeService.getPendingExternalIntake();
            (req as any).logAudit('VIEW_PENDING_INTAKE', 'ADMISSION_APPLICATION', null);
            return sendResponse(res, 200, true, 'Pending intake applications retrieved', result);
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to fetch pending intake', null, error.message);
        }
    },

    approveIntake: async (req: AuthRequest, res: Response) => {
        try {
            const { applicationId } = req.params;
            const adminId = req.user.id;

            await IntakeService.approveExternalIntake(applicationId as string);

            (req as any).logAudit('EXTERNAL_INTAKE_APPROVED', 'ADMISSION_APPLICATION', applicationId);

            return sendResponse(res, 200, true, 'Intake approved. Applicant converted to INTERNAL.');
        } catch (error: any) {
            console.error('[INTAKE_APPROVE_ERROR]', error);
            return sendResponse(res, 500, false, 'Failed to approve intake', null, error.message);
        }
    },

    rejectIntake: async (req: AuthRequest, res: Response) => {
        try {
            const { applicationId } = req.params;

            await IntakeService.rejectExternalIntake(applicationId as string);

            (req as any).logAudit('EXTERNAL_INTAKE_REJECTED', 'ADMISSION_APPLICATION', applicationId);

            return sendResponse(res, 200, true, 'Intake rejected successfully');
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to reject intake', null, error.message);
        }
    }
};
