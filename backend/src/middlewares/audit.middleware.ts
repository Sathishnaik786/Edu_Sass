import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const auditMiddleware = (req: Request, res: Response, next: NextFunction) => {
    req.logAudit = (action: string, entityType: string, entityId: string | null = null) => {
        // We treat req as potentially having user if auth middleware ran
        const userId = (req as unknown as AuthRequest).user?.id || 'anonymous';
        const timestamp = new Date().toISOString();

        // Phase-0: specific console.log
        console.log(`[AUDIT] User: ${userId} | Action: ${action} | Entity: ${entityType} | ID: ${entityId} | Time: ${timestamp}`);
    };

    next();
};
