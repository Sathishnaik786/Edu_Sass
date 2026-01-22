import 'express';

declare global {
    namespace Express {
        interface Request {
            logAudit: (action: string, entityType: string, entityId?: string | null) => void;
        }
    }
}
