import { Router } from 'express';
import { AdmissionController } from './admission.controller';
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
    rbacMiddleware(['APPLICANT', 'ADMIN', 'SUPER_ADMIN']), // Applicant to see if they need to pay, Admin to list
    AdmissionController.getPendingFees
);

router.post(
    '/fees/:applicationId/pay',
    optionalAuthMiddleware, // Allow external/unauth payment flow if needed, but usually authenticated
    AdmissionController.payFee
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
    rbacMiddleware(['FACULTY', 'ADMIN', 'SUPER_ADMIN', 'DRC']), // Guide/Faculty
    AdmissionController.submitGuideAcceptance
);

export default router;
