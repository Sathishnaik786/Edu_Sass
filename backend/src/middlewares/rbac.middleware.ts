import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { sendResponse } from '../utils/response';

export const ROLES = {
    APPLICANT: 'APPLICANT',
    DRC: 'DRC',
    ADMIN: 'ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN',
    FACULTY: 'FACULTY',
} as const;

export type Role = keyof typeof ROLES;

export const rbacMiddleware = (allowedRoles: Role[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user) {
            return sendResponse(res, 401, false, 'Unauthorized: User not authenticated');
        }

        // Checking app_metadata for role, fallback to user_metadata
        const userRole = user.app_metadata?.role || user.user_metadata?.role;

        if (!userRole || !allowedRoles.includes(userRole as Role)) {
            return sendResponse(res, 403, false, 'Forbidden: Insufficient permissions');
        }

        next();
    };
};
