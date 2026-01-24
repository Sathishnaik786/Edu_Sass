import { Router } from 'express';
import { AdmissionController } from './admission.controller';
import { AnalyticsController } from './analytics.controller';
import { IntakeController } from './intake.controller';
import { authMiddleware, optionalAuthMiddleware } from '../../middlewares/auth.middleware';
import { rbacMiddleware } from '../../middlewares/rbac.middleware';
import { auditMiddleware } from '../../middlewares/audit.middleware';

const router = Router();

router.use(auditMiddleware);

// Public Routes (Optional Auth)
router.post(
    '/pet/apply',
    optionalAuthMiddleware,
    AdmissionController.createPetApplication
);

router.get(
    '/pet/status/:reference_number',
    optionalAuthMiddleware, // Optional, just for audit user tracking if logged in
    AdmissionController.getApplicationByReference
);

// Protected Routes
router.get(
    '/my-applications',
    authMiddleware,
    // rbacMiddleware(['APPLICANT', 'DRC', 'ADMIN', 'SUPER_ADMIN']), // relaxed to allow any auth user
    AdmissionController.getUserApplications
);

router.get(
    '/applications/:id',
    authMiddleware,
    rbacMiddleware(['APPLICANT', 'DRC', 'ADMIN', 'SUPER_ADMIN']),
    AdmissionController.getApplicationById
);

router.get(
    '/applications/:applicationId/timeline',
    authMiddleware,
    // RBAC: Applicant can see own, Staff can see all. Middleware handles role check basics, logic handles ownership usually.
    // For now, allow all roles involved.
    rbacMiddleware(['APPLICANT', 'DRC', 'ADMIN', 'SUPER_ADMIN']),
    AdmissionController.getTimeline
);

// Intake Routes (Admin Only) - Phase 0
router.get(
    '/intake/pending',
    authMiddleware,
    rbacMiddleware(['ADMIN', 'SUPER_ADMIN']),
    IntakeController.getPendingIntake
);

router.post(
    '/intake/:applicationId/approve',
    authMiddleware,
    rbacMiddleware(['ADMIN', 'SUPER_ADMIN']),
    IntakeController.approveIntake
);

router.post(
    '/intake/:applicationId/reject',
    authMiddleware,
    rbacMiddleware(['ADMIN', 'SUPER_ADMIN']),
    IntakeController.rejectIntake
);

// Scrutiny Routes (DRC Only) - Phase 2
router.get(
    '/scrutiny/pending',
    authMiddleware,
    rbacMiddleware(['DRC', 'ADMIN', 'SUPER_ADMIN']),
    AdmissionController.getPendingScrutiny
);

router.post(
    '/scrutiny/:applicationId/decision',
    authMiddleware,
    rbacMiddleware(['DRC', 'ADMIN', 'SUPER_ADMIN']),
    AdmissionController.submitScrutinyDecision
);

// Interview Routes (DRC Only) - Phase 3
router.get(
    '/interviews/eligible',
    authMiddleware,
    rbacMiddleware(['DRC', 'ADMIN', 'SUPER_ADMIN']),
    AdmissionController.getEligibleInterviews
);

router.post(
    '/interviews/:applicationId/schedule',
    authMiddleware,
    rbacMiddleware(['DRC', 'ADMIN', 'SUPER_ADMIN']),
    AdmissionController.scheduleInterview
);

router.get(
    '/interviews/evaluation/pending',
    authMiddleware,
    rbacMiddleware(['DRC', 'ADMIN', 'SUPER_ADMIN']),
    AdmissionController.getPendingEvaluations
);

router.post(
    '/interviews/:interviewId/evaluate',
    authMiddleware,
    rbacMiddleware(['DRC', 'ADMIN', 'SUPER_ADMIN']),
    AdmissionController.submitEvaluation
);

router.get(
    '/verification/pending',
    authMiddleware,
    rbacMiddleware(['DRC', 'ADMIN', 'SUPER_ADMIN']),
    AdmissionController.getPendingVerifications
);

router.post(
    '/verification/:applicationId/submit',
    authMiddleware,
    rbacMiddleware(['DRC', 'ADMIN', 'SUPER_ADMIN']),
    AdmissionController.submitVerification
);

router.get(
    '/fees/pending',
    authMiddleware,
    rbacMiddleware(['APPLICANT', 'ADMIN', 'SUPER_ADMIN', 'DRC']), // Applicant to see pay, Admin/DRC to list
    AdmissionController.getPendingFees
);

router.post(
    '/fees/:applicationId/pay',
    optionalAuthMiddleware, // Allow external/unauth payment flow if needed, but usually authenticated
    AdmissionController.payFee
);

router.get(
    '/guides/available',
    authMiddleware,
    rbacMiddleware(['DRC', 'ADMIN', 'SUPER_ADMIN']),
    AdmissionController.getAvailableGuides
);

router.get(
    '/guides/pending',
    authMiddleware,
    rbacMiddleware(['DRC', 'ADMIN', 'SUPER_ADMIN']),
    AdmissionController.getPendingGuides
);

router.post(
    '/guides/:applicationId/allocate',
    authMiddleware,
    rbacMiddleware(['DRC', 'ADMIN', 'SUPER_ADMIN']),
    AdmissionController.allocateGuide
);

// Admin List Route
router.get(
    '/applications',
    authMiddleware,
    rbacMiddleware(['DRC', 'ADMIN', 'SUPER_ADMIN']),
    AdmissionController.getAllApplications
);

// Analytics Routes (Admin Only)
router.get(
    '/analytics/stats',
    authMiddleware,
    rbacMiddleware(['ADMIN', 'SUPER_ADMIN']),
    AnalyticsController.getStats
);

// PET Exemption Routes
router.post(
    '/pet/exemption/request',
    authMiddleware,
    AdmissionController.submitPetExemption
);

router.get(
    '/pet/exemption/pending',
    authMiddleware,
    rbacMiddleware(['DRC', 'ADMIN', 'SUPER_ADMIN']),
    AdmissionController.getPendingExemptions
);

router.post(
    '/pet/exemption/:exemptionId/review',
    authMiddleware,
    rbacMiddleware(['DRC', 'ADMIN', 'SUPER_ADMIN']),
    AdmissionController.reviewPetExemption
);

// Certificate Routes
router.post(
    '/applications/:applicationId/certificate',
    authMiddleware,
    rbacMiddleware(['DRC', 'ADMIN', 'SUPER_ADMIN']),
    AdmissionController.generateCertificate
);

router.get(
    '/applications/:applicationId/certificate',
    authMiddleware,
    AdmissionController.getCertificate
);

// Guide Acceptance Routes
router.post(
    '/applications/:applicationId/student-accept',
    authMiddleware,
    AdmissionController.submitStudentGuideAcceptance
);

router.post(
    '/applications/:applicationId/guide-confirm',
    authMiddleware,
    rbacMiddleware(['FACULTY', 'GUIDE', 'ADMIN', 'SUPER_ADMIN', 'DRC']), // Guide/Faculty
    AdmissionController.submitGuideAcceptance
);

// Fee Payment Routes (New Phase)
router.post(
    '/fee/initiate',
    authMiddleware,
    rbacMiddleware(['APPLICANT']),
    AdmissionController.initiateFeePayment
);

router.post(
    '/fee/confirm',
    authMiddleware,
    rbacMiddleware(['APPLICANT']),
    AdmissionController.confirmFeePayment
);

router.get(
    '/fee/:applicationId',
    authMiddleware,
    rbacMiddleware(['APPLICANT', 'ADMIN', 'SUPER_ADMIN']),
    AdmissionController.getFeeInfo
);

router.post(
    '/fee/:applicationId/verify',
    authMiddleware,
    rbacMiddleware(['ADMIN', 'SUPER_ADMIN', 'DRC']),
    AdmissionController.verifyFeePayment
);

router.post(
    '/fee/:applicationId/reject',
    authMiddleware,
    rbacMiddleware(['ADMIN', 'SUPER_ADMIN', 'DRC']),
    AdmissionController.rejectFeePayment
);

// Moved BEFORE dynamic route
router.post(
    '/guide/verify',
    authMiddleware,
    rbacMiddleware(['FACULTY', 'GUIDE']), // Allow Guide/Faculty
    AdmissionController.verifyGuide
);

router.get(
    '/guide/pending_verification',
    authMiddleware,
    rbacMiddleware(['FACULTY', 'GUIDE']), // Allow Guide/Faculty
    AdmissionController.getPendingGuideVerifications
);

router.get(
    '/guide/scholars',
    authMiddleware,
    rbacMiddleware(['FACULTY', 'GUIDE']),
    AdmissionController.getGuideScholars
);

router.get(
    '/guide/:applicationId',
    authMiddleware,
    rbacMiddleware(['APPLICANT', 'DRC', 'ADMIN', 'SUPER_ADMIN']),
    AdmissionController.getGuideAllocation
);

router.post(
    '/guide/accept',
    authMiddleware,
    rbacMiddleware(['APPLICANT']),
    AdmissionController.acceptGuide
);

router.get(
    '/guide/acceptance/:applicationId',
    authMiddleware,
    rbacMiddleware(['APPLICANT', 'DRC', 'ADMIN', 'SUPER_ADMIN']),
    AdmissionController.getGuideAcceptance
);

// Moved above
// router.post('/guide/verify', ...);
// router.get('/guide/pending_verification', ...);

export default router;
