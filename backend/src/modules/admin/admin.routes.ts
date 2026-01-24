import { Router } from 'express';
import { UserAdminController } from './user-admin.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { rbacMiddleware } from '../../middlewares/rbac.middleware';

const router = Router();

// Route: PATCH /api/admin/users/:userId/role
// Protected: SUPER_ADMIN Only
router.patch(
    '/users/:userId/role',
    authMiddleware,
    rbacMiddleware(['SUPER_ADMIN']),
    UserAdminController.updateUserRole
);

export default router;
