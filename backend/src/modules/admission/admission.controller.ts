import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { sendResponse } from '../../utils/response';
import { AdmissionService } from './admission.service';
import { CANDIDATE_TYPE } from './admission.constants';

export const AdmissionController = {
    createPetApplication: async (req: AuthRequest, res: Response) => {
        const startTime = Date.now();
        try {
            console.log(`[REQUEST] POST /api/admission/pet/apply - Start`);
            const payload = req.body;
            const user = req.user;

            // Basic validation
            if (!payload.candidate_type) {
                console.log(`[WARN] Missing candidate_type. Duration: ${Date.now() - startTime}ms`);
                return sendResponse(res, 400, false, 'Candidate Type is required.');
            }

            if (payload.candidate_type === CANDIDATE_TYPE.EXTERNAL && !payload.auth_credentials?.password) {
                return sendResponse(res, 400, false, 'External candidates must provide a password.');
            }

            if (!payload.personal_details || !payload.academic_details) {
                console.log(`[WARN] Missing required fields. Duration: ${Date.now() - startTime}ms`);
                return sendResponse(res, 400, false, 'Missing required fields: personal_details or academic_details');
            }

            const result = await AdmissionService.createPetApplication(payload, user);

            // Audit Log
            const auditUser = user ? user.id : 'EXTERNAL_CANDIDATE';
            (req as any).logAudit('PET_APPLICATION_SUBMITTED', 'ADMISSION_APPLICATION', result.id);

            console.log(`[SUCCESS] PET Application submitted. Ref: ${result.reference_number}. Duration: ${Date.now() - startTime}ms`);

            return sendResponse(res, 201, true, 'PET Application submitted successfully', {
                application_id: result.id,
                reference_number: result.reference_number,
                status: result.status
            });
        } catch (error: any) {
            console.error(`[ERROR] POST /api/admission/pet/apply - Failed after ${Date.now() - startTime}ms. Error:`, error);
            return sendResponse(res, 500, false, 'Failed to submit PET application', null, error.message);
        }
    },

    getApplicationByReference: async (req: AuthRequest, res: Response) => {
        try {
            const { reference_number } = req.params;
            const result = await AdmissionService.getApplicationByReference(reference_number as string);

            // Audit
            (req as any).logAudit('VIEW_STATUS_EXTERNAL', 'ADMISSION_APPLICATION', reference_number);

            if (!result) {
                return sendResponse(res, 404, false, 'Application not found');
            }

            // For public status check, return minimal info
            const publicData = {
                application_id: result.id,
                reference_number: result.reference_number,
                status: result.status,
                submission_date: result.created_at,
                candidate_type: result.candidate_type
            };

            return sendResponse(res, 200, true, 'Application status retrieved', publicData);
        } catch (error) {
            return sendResponse(res, 500, false, 'Failed to retrieve application status', null, error);
        }
    },

    getApplicationById: async (req: AuthRequest, res: Response) => {
        try {
            const { id } = req.params;
            const result = await AdmissionService.getApplicationById(id as string);

            // Audit Log
            (req as any).logAudit('VIEW_APPLICATION', 'ADMISSION_APPLICATION', id);

            if (!result) {
                return sendResponse(res, 404, false, 'Application not found');
            }

            return sendResponse(res, 200, true, 'Application retrieved successfully', result);
        } catch (error) {
            return sendResponse(res, 500, false, 'Failed to retrieve application', null, error);
        }
    },

    getAllApplications: async (req: AuthRequest, res: Response) => {
        try {
            const result = await AdmissionService.getAllApplications();

            // Audit Log
            (req as any).logAudit('VIEW_ALL_APPLICATIONS', 'ADMISSION_APPLICATION', null);

            return sendResponse(res, 200, true, 'Applications retrieved successfully', result);
        } catch (error) {
            return sendResponse(res, 500, false, 'Failed to retrieve applications', null, error);
        }
    },

    getUserApplications: async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user.id;
            const result = await AdmissionService.getUserApplications(userId);

            // Audit Log
            (req as any).logAudit('VIEW_MY_APPLICATIONS', 'ADMISSION_APPLICATION', null);

            return sendResponse(res, 200, true, 'User applications retrieved successfully', result);
        } catch (error) {
            return sendResponse(res, 500, false, 'Failed to retrieve user applications', null, error);
        }
    },

    getPendingScrutiny: async (req: AuthRequest, res: Response) => {
        try {
            const result = await AdmissionService.getApplicationsForScrutiny();

            (req as any).logAudit('VIEW_PENDING_SCRUTINY', 'ADMISSION_APPLICATION', null);

            return sendResponse(res, 200, true, 'Pending scrutiny applications retrieved', result);
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to fetch pending applications', null, error.message);
        }
    },

    submitScrutinyDecision: async (req: AuthRequest, res: Response) => {
        try {
            const { applicationId } = req.params;
            const { decision, remarks } = req.body;
            const reviewerId = req.user.id;

            if (!['APPROVE', 'REJECT'].includes(decision)) {
                return sendResponse(res, 400, false, 'Invalid decision. Must be APPROVE or REJECT');
            }
            if (decision === 'REJECT' && !remarks) {
                return sendResponse(res, 400, false, 'Remarks are mandatory for rejection');
            }

            await AdmissionService.submitScrutinyDecision(applicationId as string, decision, remarks || '', reviewerId);

            const action = decision === 'APPROVE' ? 'PET_SCRUTINY_APPROVED' : 'PET_SCRUTINY_REJECTED';
            (req as any).logAudit(action, 'ADMISSION_APPLICATION', applicationId);

            return sendResponse(res, 200, true, `Application ${decision}D successfully`);
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to submit scrutiny decision', null, error.message);
        }
    },

    getEligibleInterviews: async (req: AuthRequest, res: Response) => {
        try {
            const result = await AdmissionService.getEligibleForInterview();
            (req as any).logAudit('VIEW_ELIGIBLE_FOR_INTERVIEW', 'ADMISSION_APPLICATION', null);
            return sendResponse(res, 200, true, 'Eligible applications retrieved', result);
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to fetch eligible applications', null, error.message);
        }
    },

    scheduleInterview: async (req: AuthRequest, res: Response) => {
        try {
            const { applicationId } = req.params;
            const schedule = req.body; // type InterviewScheduleInput
            const userId = req.user.id; // DRC

            if (!schedule.interview_date || !schedule.interview_mode || !schedule.panel_members) {
                return sendResponse(res, 400, false, 'Missing required interview fields');
            }

            await AdmissionService.scheduleInterview(applicationId as string, schedule, userId);

            (req as any).logAudit('PET_INTERVIEW_SCHEDULED', 'ADMISSION_APPLICATION', applicationId);

            return sendResponse(res, 200, true, 'Interview scheduled successfully');
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to schedule interview', null, error.message);
        }
    },

    getPendingEvaluations: async (req: AuthRequest, res: Response) => {
        try {
            const result = await AdmissionService.getScheduledInterviewsForEvaluation();
            return sendResponse(res, 200, true, 'Pending evaluations retrieved', result);
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to fetch pending evaluations', null, error.message);
        }
    },

    submitEvaluation: async (req: AuthRequest, res: Response) => {
        try {
            const { interviewId } = req.params;
            const { evaluation_score, recommendation, remarks } = req.body;
            const evaluatorId = req.user.id;

            if (evaluation_score === undefined || !recommendation) {
                return sendResponse(res, 400, false, 'Score and recommendation are required');
            }
            if (recommendation === 'FAIL' && !remarks) {
                return sendResponse(res, 400, false, 'Remarks are mandatory for failure');
            }

            await AdmissionService.submitInterviewEvaluation(interviewId as string, { evaluation_score, recommendation, remarks }, evaluatorId);

            const action = recommendation === 'PASS' ? 'PET_INTERVIEW_EVALUATED' : 'PET_INTERVIEW_FAILED';
            (req as any).logAudit(action, 'ADMISSION_INTERVIEW', interviewId);

            return sendResponse(res, 200, true, 'Evaluation submitted successfully');
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to submit evaluation', null, error.message);
        }
    },

    getPendingVerifications: async (req: AuthRequest, res: Response) => {
        try {
            const result = await AdmissionService.getApplicationsForDocumentVerification();
            return sendResponse(res, 200, true, 'Pending verifications retrieved', result);
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to fetch pending verifications', null, error.message);
        }
    },

    submitVerification: async (req: AuthRequest, res: Response) => {
        try {
            const { applicationId } = req.params;
            const { verification_status, remarks } = req.body; // DocumentVerificationInput
            const verifierId = req.user.id;

            if (!['VERIFIED', 'REJECTED'].includes(verification_status)) {
                return sendResponse(res, 400, false, 'Invalid verification status');
            }
            if (!remarks) {
                return sendResponse(res, 400, false, 'Remarks are required for verification records');
            }

            await AdmissionService.submitDocumentVerification(applicationId as string, { verification_status, remarks }, verifierId);

            const action = verification_status === 'VERIFIED' ? 'PET_DOCS_VERIFIED' : 'PET_DOCS_REJECTED';
            (req as any).logAudit(action, 'ADMISSION_APPLICATION', applicationId);

            return sendResponse(res, 200, true, 'Document verification submitted successfully');
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to submit verification', null, error.message);
        }
    },

    getPendingFees: async (req: AuthRequest, res: Response) => {
        try {
            const { type } = req.query;

            if (type === 'verification') {
                const result = await AdmissionService.getPendingFeeVerifications();
                return sendResponse(res, 200, true, 'Pending fee verifications retrieved', result);
            }

            const result = await AdmissionService.getApplicationsEligibleForPayment();
            return sendResponse(res, 200, true, 'Pending fee applications retrieved', result);
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to fetch pending fees', null, error.message);
        }
    },

    payFee: async (req: AuthRequest, res: Response) => {
        try {
            const { applicationId } = req.params;
            const { amount, payment_reference, payment_mode } = req.body; // FeePaymentInput
            const userId = req.user?.id; // Could be Applicant (if online), or Admin (if offline record)

            if (!amount || !payment_mode) {
                return sendResponse(res, 400, false, 'Amount and Payment Mode are required');
            }

            // Simple reference gen for now if empty (e.g. online initiated)
            const reference = payment_reference || `PAY-${Date.now()}`;

            await AdmissionService.recordFeePayment(applicationId as string, { amount, payment_reference: reference, payment_mode }, userId);

            (req as any).logAudit('PET_FEE_PAID', 'ADMISSION_APPLICATION', applicationId);

            return sendResponse(res, 200, true, 'Fee payment recorded successfully');
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to record fee payment', null, error.message);
        }
    },

    getPendingGuides: async (req: AuthRequest, res: Response) => {
        try {
            const result = await AdmissionService.getApplicationsEligibleForGuideAllocation();
            return sendResponse(res, 200, true, 'Pending guide allocation applications retrieved', result);
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to fetch pending allocations', null, error.message);
        }
    },

    allocateGuide: async (req: AuthRequest, res: Response) => {
        try {
            const { applicationId } = req.params;
            const { guide_faculty_id, remarks } = req.body; // GuideAllocationInput
            const allocatorId = req.user.id; // DRC or Admin

            if (!guide_faculty_id) {
                return sendResponse(res, 400, false, 'Guide Faculty ID is required');
            }

            await AdmissionService.allocateGuide(applicationId as string, { guide_faculty_id, remarks }, allocatorId);

            (req as any).logAudit('PET_GUIDE_ALLOCATED', 'ADMISSION_APPLICATION', applicationId);

            return sendResponse(res, 200, true, 'Guide allocated successfully');
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to allocate guide', null, error.message);
        }
    },

    submitPetExemption: async (req: AuthRequest, res: Response) => {
        try {
            const payload = req.body;
            const user = req.user;

            if (!payload.application_id || !payload.exemption_reason) {
                return sendResponse(res, 400, false, 'Application ID and Reason are required');
            }

            await AdmissionService.submitPetExemption(payload, user);
            (req as any).logAudit('PET_EXEMPTION_REQUESTED', 'ADMISSION_APPLICATION', payload.application_id);

            return sendResponse(res, 201, true, 'PET Exemption request submitted successfully');
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to submit exemption request', null, error.message);
        }
    },

    reviewPetExemption: async (req: AuthRequest, res: Response) => {
        try {
            const { exemptionId } = req.params;
            const { decision, remarks } = req.body;
            const reviewerId = req.user.id;

            if (!['APPROVE', 'REJECT'].includes(decision)) {
                return sendResponse(res, 400, false, 'Invalid decision');
            }
            if (decision === 'REJECT' && !remarks) {
                return sendResponse(res, 400, false, 'Remarks are required for rejection');
            }

            await AdmissionService.reviewPetExemption(exemptionId as string, decision, remarks || '', reviewerId);

            const action = decision === 'APPROVE' ? 'PET_EXEMPTION_APPROVED' : 'PET_EXEMPTION_REJECTED';
            (req as any).logAudit(action, 'ADMISSION_PET_EXEMPTION', exemptionId);

            return sendResponse(res, 200, true, 'PET Exemption review submitted successfully');
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to review exemption request', null, error.message);
        }
    },

    getPendingExemptions: async (req: AuthRequest, res: Response) => {
        try {
            const result = await AdmissionService.getPendingPetExemptions();
            return sendResponse(res, 200, true, 'Pending exemptions retrieved', result);
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to fetch pending exemptions', null, error.message);
        }
    },

    generateCertificate: async (req: AuthRequest, res: Response) => {
        try {
            const { applicationId } = req.params;
            const issuerId = req.user.id;

            const result = await AdmissionService.generateAllocationCertificate(applicationId as string, issuerId);
            (req as any).logAudit('GUIDE_ALLOCATION_CERT_ISSUED', 'ADMISSION_APPLICATION', applicationId);

            return sendResponse(res, 201, true, 'Certificate generated successfully', result);
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to generate certificate', null, error.message);
        }
    },

    getCertificate: async (req: AuthRequest, res: Response) => {
        try {
            const { applicationId } = req.params;
            const result = await AdmissionService.getCertificateByApplicationId(applicationId as string);

            if (!result) {
                return sendResponse(res, 404, false, 'Certificate not found');
            }

            return sendResponse(res, 200, true, 'Certificate retrieved successfully', result);
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to retrieve certificate', null, error.message);
        }
    },

    submitStudentGuideAcceptance: async (req: AuthRequest, res: Response) => {
        try {
            const { applicationId } = req.params;
            const userId = req.user.id;

            await AdmissionService.submitStudentGuideAcceptance(applicationId as string, userId);
            (req as any).logAudit('GUIDE_ACCEPTED_BY_STUDENT', 'ADMISSION_APPLICATION', applicationId);

            return sendResponse(res, 200, true, 'Guide allocation accepted successfully');
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to accept guide allocation', null, error.message);
        }
    },

    submitGuideAcceptance: async (req: AuthRequest, res: Response) => {
        try {
            const { applicationId } = req.params;
            const { decision, remarks } = req.body;
            const guideId = req.user.id;

            if (!['ACCEPT', 'REJECT'].includes(decision)) {
                return sendResponse(res, 400, false, 'Invalid decision');
            }

            await AdmissionService.submitGuideAcceptance(applicationId as string, decision, remarks || '', guideId);

            const action = decision === 'ACCEPT' ? 'ADMISSION_CONFIRMED' : 'GUIDE_REJECTED';
            (req as any).logAudit(action, 'ADMISSION_APPLICATION', applicationId);

            return sendResponse(res, 200, true, `Application ${decision}ED successfully`);
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to submit guide confirmation', null, error.message);
        }
    },

    getTimeline: async (req: AuthRequest, res: Response) => {
        try {
            const { applicationId } = req.params;
            const result = await AdmissionService.getTimeline(applicationId as string);

            (req as any).logAudit('VIEW_TIMELINE', 'ADMISSION_APPLICATION', applicationId);

            return sendResponse(res, 200, true, 'Timeline retrieved successfully', result);
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to fetch timeline', null, error.message);
        }
    },

    // Fee Payment Endpoints (Applicant)
    initiateFeePayment: async (req: AuthRequest, res: Response) => {
        try {
            const { applicationId } = req.body;
            const userId = req.user.id;

            if (!applicationId) return sendResponse(res, 400, false, 'Application ID is required');

            const result = await AdmissionService.initiateFeePayment(applicationId, userId);
            (req as any).logAudit('FEE_PAYMENT_INITIATED', 'ADMISSION_APPLICATION', applicationId);

            return sendResponse(res, 201, true, 'Fee payment initiated', result);
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to initiate fee payment', null, error.message);
        }
    },

    confirmFeePayment: async (req: AuthRequest, res: Response) => {
        try {
            const { applicationId, transactionReference } = req.body;
            const userId = req.user.id;

            if (!applicationId || !transactionReference) return sendResponse(res, 400, false, 'App ID and Reference required');

            const result = await AdmissionService.confirmFeePayment(applicationId, transactionReference, userId);
            (req as any).logAudit('FEE_PAYMENT_CONFIRMED', 'ADMISSION_APPLICATION', applicationId);

            return sendResponse(res, 200, true, 'Fee payment confirmed', result);
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to confirm fee payment', null, error.message);
        }
    },

    getFeeInfo: async (req: AuthRequest, res: Response) => {
        try {
            const { applicationId } = req.params;
            const result = await AdmissionService.getFeePayment(applicationId as string);
            return sendResponse(res, 200, true, 'Fee details retrieved', result);
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to fetch fee details', null, error.message);
        }
    },

    // Admin/DRC Verification Endpoints
    verifyFeePayment: async (req: AuthRequest, res: Response) => {
        try {
            const { applicationId } = req.params;
            const { remark } = req.body;
            const verifierId = req.user.id; // Admin/DRC

            await AdmissionService.verifyFeePayment(applicationId as string, verifierId, remark || '');
            (req as any).logAudit('FEE_VERIFIED', 'ADMISSION_FEE', applicationId);
            return sendResponse(res, 200, true, 'Fee payment verified successfully');
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to verify fee', null, error.message);
        }
    },

    rejectFeePayment: async (req: AuthRequest, res: Response) => {
        try {
            const { applicationId } = req.params;
            const { remark } = req.body;
            const verifierId = req.user.id;

            if (!remark) return sendResponse(res, 400, false, 'Remark is mandatory for rejection');

            await AdmissionService.rejectFeePayment(applicationId as string, verifierId, remark);
            (req as any).logAudit('FEE_REJECTED', 'ADMISSION_FEE', applicationId);
            return sendResponse(res, 200, true, 'Fee payment rejected successfully');
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to reject fee', null, error.message);
        }
    },

    getGuideAllocation: async (req: AuthRequest, res: Response) => {
        try {
            const { applicationId } = req.params;
            const result = await AdmissionService.getGuideAllocation(applicationId as string);
            return sendResponse(res, 200, true, 'Guide allocation retrieved', result);
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to fetch guide allocation', null, error.message);
        }
    },

    acceptGuide: async (req: AuthRequest, res: Response) => {
        try {
            const { applicationId, remark } = req.body;
            const userId = req.user.id;

            if (!applicationId) return sendResponse(res, 400, false, 'Application ID is required');

            await AdmissionService.acceptGuide(applicationId, userId, remark || '');
            (req as any).logAudit('GUIDE_ACCEPTED', 'ADMISSION_GUIDE', applicationId);
            return sendResponse(res, 200, true, 'Guide allocation accepted successfully');
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to accept guide', null, error.message);
        }
    },

    getGuideAcceptance: async (req: AuthRequest, res: Response) => {
        try {
            const { applicationId } = req.params;
            const result = await AdmissionService.getGuideAcceptance(applicationId as string);
            return sendResponse(res, 200, true, 'Guide acceptance retrieved', result);
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to fetch guide acceptance', null, error.message);
        }
    },

    verifyGuide: async (req: AuthRequest, res: Response) => {
        try {
            const { applicationId, remark, status } = req.body;
            const guideId = req.user.id;

            if (!applicationId || !status) return sendResponse(res, 400, false, 'Missing required fields');
            if (!['VERIFIED', 'REJECTED'].includes(status)) return sendResponse(res, 400, false, 'Invalid status');

            await AdmissionService.verifyGuide(applicationId, guideId, remark || '', status);
            (req as any).logAudit('GUIDE_VERIFIED', 'ADMISSION_GUIDE', applicationId);
            return sendResponse(res, 200, true, 'Guide verification processed successfully');
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to process verification', null, error.message);
        }
    },

    getPendingGuideVerifications: async (req: AuthRequest, res: Response) => {
        try {
            const guideId = req.user.id;
            const result = await AdmissionService.getPendingGuideVerifications(guideId);
            return sendResponse(res, 200, true, 'Pending verifications fetched', result);
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to fetch pending verifications', null, error.message);
        }
    },

    getGuideScholars: async (req: AuthRequest, res: Response) => {
        try {
            const guideId = req.user.id;
            const result = await AdmissionService.getGuideScholars(guideId);
            return sendResponse(res, 200, true, 'Scholars fetched', result);
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to fetch scholars', null, error.message);
        }
    },

    getAvailableGuides: async (req: AuthRequest, res: Response) => {
        try {
            const guides = await AdmissionService.getAvailableGuides();
            return sendResponse(res, 200, true, 'Available guides retrieved', guides);
        } catch (error: any) {
            return sendResponse(res, 500, false, 'Failed to fetch available guides', null, error.message);
        }
    }
};
