import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { sendResponse } from '../utils/response';
import { resolveUserRole } from '../utils/resolveUserRole';
import { Role } from '../constants/roles';

export const rbacMiddleware = (allowedRoles: string[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user) {
            return sendResponse(res, 401, false, 'Unauthorized: User not authenticated');
        }

        try {
            // DATABASE-DRIVEN: Resolve role from DB tables
            const userRole = await resolveUserRole(user.id);

            if (!userRole) {
                console.warn(`[SECURITY] User ${user.id} has no database assigned role.`);
                return sendResponse(res, 403, false, 'Forbidden: User has no assigned role');
            }

            if (!allowedRoles.includes(userRole)) {
                console.warn(`[SECURITY] User ${user.id} with role ${userRole} attempted to access restricted resource.`);
                return sendResponse(res, 403, false, 'Forbidden: Insufficient permissions');
            }

            // Attach role to request for controllers if needed
            (req as any).role = userRole;

            next();
        } catch (error) {
            console.error("RBAC Check Failed:", error);
            return sendResponse(res, 500, false, "Internal Authorization Error");
        }
    };
};
