import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';
import { sendResponse } from '../utils/response';

export interface AuthRequest extends Request {
    user?: any;
}

// Blocks unauthenticated requests
export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return sendResponse(res, 401, false, 'Unauthorized: No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Strict Auth: No bypasses allowed.

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return sendResponse(res, 401, false, 'Unauthorized: Invalid token');
        }

        req.user = user;
        next();
    } catch (err) {
        return sendResponse(res, 500, false, 'Internal Server Error during authentication', null, err);
    }
};

// Allows unauthenticated requests but attaches user if token is valid
export const optionalAuthMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    console.log('OptionalAuthMiddleware running');
    console.log('Auth Header:', authHeader);

    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        // Strict Optional Auth

        try {
            const { data: { user }, error } = await supabase.auth.getUser(token);
            if (!error && user) {
                req.user = user;
            }
        } catch (err) {
            // Ignore errors for optional auth
        }
    }
    next();
};

// Extend the AuthRequest type to include logAudit (re-declaring here to ensure visibility if needed)
declare module './auth.middleware' {
    interface AuthRequest {
        logAudit: (action: string, entityType: string, entityId?: string | null) => void;
    }
}
