import { AdmissionApplication, PetApplicationInput, ExternalApplicantSnapshot, InterviewScheduleInput, InterviewEvaluationInput, DocumentVerificationInput, FeePaymentInput, GuideAllocationInput, PetExemptionInput, PetExemptionReviewInput } from './admission.types';
import { supabase } from '../../lib/supabase';
import { ADMISSION_STATUS, APPLICATION_TYPE, CANDIDATE_TYPE } from './admission.constants';
import { v4 as uuidv4 } from 'uuid';

export const AdmissionService = {
    createPetApplication: async (payload: PetApplicationInput, user?: any): Promise<AdmissionApplication> => {
        // Generate Reference Number (Simple Logic for Phase-0/1)
        const referenceNumber = `PET-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

        // Handle INTERNAL Candidates
        if (payload.candidate_type === CANDIDATE_TYPE.INTERNAL) {
            if (!user) {
                throw new Error('Internal candidates must be logged in.');
            }

            // Check for existing active application
            const { data: existingApps } = await supabase
                .from('admission_applications')
                .select('*')
                .eq('applicant_id', user.id)
                .eq('application_type', APPLICATION_TYPE.PET)
                .in('status', [ADMISSION_STATUS.SUBMITTED, ADMISSION_STATUS.UNDER_SCRUTINY])
                .is('deleted_at', null);

            if (existingApps && existingApps.length > 0) {
                throw new Error('You already have an active PET application.');
            }

            // Create Internal Application
            const { data: newApp, error: insertError } = await supabase
                .from('admission_applications')
                .insert({
                    applicant_id: user.id,
                    candidate_type: CANDIDATE_TYPE.INTERNAL,
                    application_type: APPLICATION_TYPE.PET,
                    status: ADMISSION_STATUS.SUBMITTED,
                    payload: payload,
                    reference_number: referenceNumber
                })
                .select()
                .single();

            if (insertError) throw new Error(insertError.message);

            await createHistory(newApp.id, ADMISSION_STATUS.SUBMITTED, user.id, 'Internal Submission');
            return newApp as AdmissionApplication;
        }

        // Handle EXTERNAL Candidates
        else if (payload.candidate_type === CANDIDATE_TYPE.EXTERNAL) {
            if (!payload.email || !payload.mobile || !payload.identity_document) {
                throw new Error('Email, Mobile and Identity Document are required for External candidates.');
            }

            // Check email uniqueness check for External (Simple check on snapshot or payload)
            // Note: In a real system we might check a users table or specific external_applicants table. 
            // For now, checking payload->email overlap is expensive in JSONB without specific index. 
            // Proceeding with assumption that duplications are allowed for Phase-1 testing or handled by unique constraint on identity if added.
            // We will skip strict uniqueness check for Phase-1 External to keep it simple unless specified.

            const snapshot: ExternalApplicantSnapshot = {
                email: payload.email,
                mobile: payload.mobile,
                identity_document: payload.identity_document,
                full_name: payload.personal_details.full_name
            };

            const { data: newApp, error: insertError } = await supabase
                .from('admission_applications')
                .insert({
                    applicant_id: null, // No user ID
                    candidate_type: CANDIDATE_TYPE.EXTERNAL,
                    application_type: APPLICATION_TYPE.PET,
                    status: ADMISSION_STATUS.SUBMITTED,
                    payload: payload,
                    external_applicant_snapshot: snapshot,
                    reference_number: referenceNumber
                })
                .select()
                .single();

            if (insertError) throw new Error(insertError.message);

            await createHistory(newApp.id, ADMISSION_STATUS.SUBMITTED, '00000000-0000-0000-0000-000000000000', 'External Submission');
            return newApp as AdmissionApplication;
        }

        throw new Error('Invalid Candidate Type');
    },

    getApplicationByReference: async (referenceNumber: string): Promise<AdmissionApplication | null> => {
        const { data, error } = await supabase
            .from('admission_applications')
            .select('*')
            .eq('reference_number', referenceNumber)
            .single();

        if (error) return null;
        return data as AdmissionApplication;
    },

    getApplicationById: async (id: string): Promise<AdmissionApplication | null> => {
        const { data, error } = await supabase
            .from('admission_applications')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data as AdmissionApplication;
    },

    getUserApplications: async (userId: string): Promise<AdmissionApplication[]> => {
        const { data, error } = await supabase
            .from('admission_applications')
            .select('*')
            .eq('applicant_id', userId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data as AdmissionApplication[];
    },

    getAllApplications: async (): Promise<AdmissionApplication[]> => {
        const { data, error } = await supabase
            .from('admission_applications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data as AdmissionApplication[];
    },

    getApplicationsForScrutiny: async (): Promise<AdmissionApplication[]> => {
        const { data, error } = await supabase
            .from('admission_applications')
            .select('*')
            .eq('application_type', APPLICATION_TYPE.PET)
            .eq('status', ADMISSION_STATUS.SUBMITTED)
            .order('created_at', { ascending: true });

        if (error) throw new Error(error.message);
        return data as AdmissionApplication[];
    },

    submitScrutinyDecision: async (applicationId: string, decision: 'APPROVE' | 'REJECT', remarks: string, reviewerId: string) => {
        // ... (existing code, ensure it is unchanged in context in real edit)
        // Re-declaring for context match in LLM response
        const newStatus = decision === 'APPROVE' ? ADMISSION_STATUS.SCRUTINY_APPROVED : ADMISSION_STATUS.SCRUTINY_REJECTED;

        // 1. Update Application Status
        const { error: updateError } = await supabase
            .from('admission_applications')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', applicationId);

        if (updateError) throw new Error(updateError.message);

        // 2. Insert Scrutiny Review
        const { error: reviewError } = await supabase
            .from('admission_scrutiny_reviews')
            .insert({
                application_id: applicationId,
                reviewed_by: reviewerId,
                decision: decision,
                remarks: remarks
            });

        if (reviewError) console.error('Error logging scrutiny review:', reviewError);

        // 3. Update Status History
        await createHistory(applicationId, newStatus, reviewerId, `Scrutiny ${decision}: ${remarks}`);

        return { success: true };
    },

    getEligibleForInterview: async (): Promise<AdmissionApplication[]> => {
        const { data, error } = await supabase
            .from('admission_applications')
            .select('*')
            .eq('application_type', APPLICATION_TYPE.PET)
            .eq('status', ADMISSION_STATUS.SCRUTINY_APPROVED)
            .order('updated_at', { ascending: true }); // FCFS bases logic or recent scrutiny

        if (error) throw new Error(error.message);
        return data as AdmissionApplication[];
    },

    scheduleInterview: async (applicationId: string, schedule: InterviewScheduleInput, creatorId: string) => {
        // 1. Check if eligible
        const currentApp = await AdmissionService.getApplicationById(applicationId);
        if (!currentApp || currentApp.status !== ADMISSION_STATUS.SCRUTINY_APPROVED) {
            throw new Error('Application is not eligible for interview scheduling.');
        }

        // 2. Insert Interview
        const { error: insertError } = await supabase
            .from('admission_interviews')
            .insert({
                application_id: applicationId,
                interview_date: schedule.interview_date,
                interview_mode: schedule.interview_mode,
                interview_location: schedule.interview_location,
                panel_members: schedule.panel_members,
                created_by: creatorId
            });

        if (insertError) throw new Error(insertError.message);

        // 3. Update Status
        const { error: statusError } = await supabase
            .from('admission_applications')
            .update({ status: ADMISSION_STATUS.INTERVIEW_SCHEDULED, updated_at: new Date().toISOString() })
            .eq('id', applicationId);

        if (statusError) {
            // Rollback interview insert ideally
            console.error('Failed to update app status after scheduling interview', statusError);
            throw new Error('Failed to update application status');
        }

        // 4. History
        await createHistory(applicationId, ADMISSION_STATUS.INTERVIEW_SCHEDULED, creatorId, `Interview Scheduled on ${schedule.interview_date}`);

        return { success: true };
    },

    getScheduledInterviewsForEvaluation: async () => {
        // Join applications and interviews
        const { data, error } = await supabase
            .from('admission_interviews')
            .select(`
                *,
                admission_applications!inner (*)
            `)
            .eq('admission_applications.status', ADMISSION_STATUS.INTERVIEW_SCHEDULED)
            .order('interview_date', { ascending: true });

        if (error) throw new Error(error.message);
        return data; // Returns interview objects with nested application data
    },

    submitInterviewEvaluation: async (interviewId: string, payload: InterviewEvaluationInput, evaluatorId: string) => {
        // 1. Fetch Interview Data to get Application ID
        const { data: interview, error: fetchError } = await supabase
            .from('admission_interviews')
            .select('application_id, admission_applications(status)')
            .eq('id', interviewId)
            .single();

        if (fetchError || !interview) throw new Error('Interview not found');

        // Use Type Assertion for safe access if needed, or assume shape
        const appStatus = (interview.admission_applications as any).status;
        if (appStatus !== ADMISSION_STATUS.INTERVIEW_SCHEDULED) {
            throw new Error('Application is not in Scheduled stage.');
        }

        const applicationId = interview.application_id;
        const newStatus = payload.recommendation === 'PASS'
            ? ADMISSION_STATUS.INTERVIEW_PASSED
            : ADMISSION_STATUS.INTERVIEW_FAILED;

        // 2. Insert Evaluation
        const { error: insertError } = await supabase
            .from('admission_interview_evaluations')
            .insert({
                interview_id: interviewId,
                application_id: applicationId,
                evaluation_score: payload.evaluation_score,
                recommendation: payload.recommendation,
                remarks: payload.remarks,
                evaluated_by: evaluatorId
            });

        if (insertError) throw new Error(insertError.message);

        // 3. Update Application Status
        const { error: updateError } = await supabase
            .from('admission_applications')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', applicationId);

        if (updateError) throw new Error('Failed to update application status');

        // 4. History
        await createHistory(applicationId, newStatus, evaluatorId, `Interview Evaluation: ${payload.recommendation} - Score: ${payload.evaluation_score}`);

        return { success: true };
    },

    getApplicationsForDocumentVerification: async (): Promise<AdmissionApplication[]> => {
        const { data, error } = await supabase
            .from('admission_applications')
            .select('*')
            .eq('application_type', APPLICATION_TYPE.PET)
            .eq('status', ADMISSION_STATUS.INTERVIEW_PASSED)
            .order('updated_at', { ascending: true });

        if (error) throw new Error(error.message);
        return data as AdmissionApplication[];
    },

    submitDocumentVerification: async (applicationId: string, payload: DocumentVerificationInput, verifierId: string) => {
        // 1. Validate eligibility
        const currentApp = await AdmissionService.getApplicationById(applicationId);
        if (!currentApp || currentApp.status !== ADMISSION_STATUS.INTERVIEW_PASSED) {
            throw new Error('Application is not eligible for document verification.');
        }

        const newStatus = payload.verification_status === 'VERIFIED'
            ? ADMISSION_STATUS.DOCUMENTS_VERIFIED
            : ADMISSION_STATUS.DOCUMENTS_REJECTED;

        // 2. Insert Verification Record
        const { error: insertError } = await supabase
            .from('admission_document_verifications')
            .insert({
                application_id: applicationId,
                verification_status: payload.verification_status,
                remarks: payload.remarks,
                verified_by: verifierId
            });

        if (insertError) throw new Error(insertError.message);

        // 3. Update Application Status
        const { error: updateError } = await supabase
            .from('admission_applications')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', applicationId);

        if (updateError) throw new Error('Failed to update application status');

        // 4. History
        await createHistory(applicationId, newStatus, verifierId, `Documents ${payload.verification_status}: ${payload.remarks}`);

        return { success: true };
    },

    getApplicationsEligibleForPayment: async (): Promise<AdmissionApplication[]> => {
        const { data, error } = await supabase
            .from('admission_applications')
            .select('*')
            .eq('application_type', APPLICATION_TYPE.PET)
            .eq('status', ADMISSION_STATUS.DOCUMENTS_VERIFIED)
            .order('updated_at', { ascending: true });

        if (error) throw new Error(error.message);
        return data as AdmissionApplication[];
    },

    recordFeePayment: async (applicationId: string, payload: FeePaymentInput, recorderId?: string) => {
        // 1. Verify Eligibility
        const currentApp = await AdmissionService.getApplicationById(applicationId);
        if (!currentApp || currentApp.status !== ADMISSION_STATUS.DOCUMENTS_VERIFIED) {
            throw new Error('Application is not eligible for fee payment.');
        }

        // 2. Insert Payment Record
        const { error: insertError } = await supabase
            .from('admission_fee_payments')
            .insert({
                application_id: applicationId,
                amount: payload.amount,
                payment_reference: payload.payment_reference,
                payment_status: 'PAID', // Assumed success for implementation
                payment_mode: payload.payment_mode,
                recorded_by: recorderId || null
            });

        if (insertError) throw new Error(insertError.message);

        // 3. Update App Status
        const { error: statusError } = await supabase
            .from('admission_applications')
            .update({ status: ADMISSION_STATUS.FEE_PAID, updated_at: new Date().toISOString() })
            .eq('id', applicationId);

        if (statusError) throw new Error('Failed to update application status');

        // 4. History
        await createHistory(applicationId, ADMISSION_STATUS.FEE_PAID, recorderId || 'SYSTEM', `Fee Paid: ${payload.amount} (${payload.payment_mode})`);

        return { success: true };
    },

    getApplicationsEligibleForGuideAllocation: async (): Promise<AdmissionApplication[]> => {
        const { data, error } = await supabase
            .from('admission_applications')
            .select('*')
            .eq('application_type', APPLICATION_TYPE.PET)
            .eq('status', ADMISSION_STATUS.FEE_PAID)
            .order('updated_at', { ascending: true });

        if (error) throw new Error(error.message);
        return data as AdmissionApplication[];
    },

    allocateGuide: async (applicationId: string, payload: GuideAllocationInput, allocatorId: string) => {
        // 1. Verify Eligibility
        const currentApp = await AdmissionService.getApplicationById(applicationId);
        if (!currentApp || currentApp.status !== ADMISSION_STATUS.FEE_PAID) {
            throw new Error('Application is not eligible for guide allocation.');
        }

        // 2. Insert Allocation Record
        const { error: insertError } = await supabase
            .from('admission_guide_allocations')
            .insert({
                application_id: applicationId,
                guide_faculty_id: payload.guide_faculty_id,
                remarks: payload.remarks,
                allocated_by: allocatorId
            });

        if (insertError) throw new Error(insertError.message);

        // 3. Update App Status
        const { error: statusError } = await supabase
            .from('admission_applications')
            .update({ status: ADMISSION_STATUS.GUIDE_ALLOCATED, updated_at: new Date().toISOString() })
            .eq('id', applicationId);

        if (statusError) throw new Error('Failed to update application status');

        // 4. History
        await createHistory(applicationId, ADMISSION_STATUS.GUIDE_ALLOCATED, allocatorId, `Guide Allocated: ${payload.guide_faculty_id}`);

        // 5. Auto-generate Certificate (Phase-9)
        try {
            await AdmissionService.generateAllocationCertificate(applicationId, allocatorId);
        } catch (certError) {
            console.error('Failed to auto-generate certificate during allocation:', certError);
            // We don't throw here to avoid failing the whole allocation process
        }

        return { success: true };
    },

    submitPetExemption: async (payload: PetExemptionInput, user: any) => {
        // 1. Validate application
        const app = await AdmissionService.getApplicationById(payload.application_id);
        if (!app) throw new Error('Application not found');
        if (app.candidate_type !== CANDIDATE_TYPE.INTERNAL) {
            throw new Error('Only Internal candidates can request PET exemption.');
        }

        // 2. Check for duplicate request
        const { data: existing } = await supabase
            .from('admission_pet_exemptions')
            .select('id')
            .eq('application_id', payload.application_id)
            .single();

        if (existing) throw new Error('Exemption request already exists for this application.');

        // 3. Create Request
        const { error: insertError } = await supabase
            .from('admission_pet_exemptions')
            .insert({
                application_id: payload.application_id,
                exemption_reason: payload.exemption_reason,
                supporting_documents: payload.supporting_documents,
                requested_by: user.id,
                status: 'PENDING'
            });

        if (insertError) throw new Error(insertError.message);

        // 4. Update History
        await createHistory(payload.application_id, ADMISSION_STATUS.PET_EXEMPTION_REQUESTED, user.id, `PET Exemption Requested: ${payload.exemption_reason}`);

        return { success: true };
    },

    reviewPetExemption: async (exemptionId: string, decision: 'APPROVE' | 'REJECT', remarks: string, reviewerId: string) => {
        // 1. Fetch exemption record
        const { data: exemption, error: fetchError } = await supabase
            .from('admission_pet_exemptions')
            .select('*')
            .eq('id', exemptionId)
            .single();

        if (fetchError || !exemption) throw new Error('Exemption request not found');
        if (exemption.status !== 'PENDING') throw new Error('Request has already been processed.');

        // 2. Update Exemption record
        const { error: updateExError } = await supabase
            .from('admission_pet_exemptions')
            .update({
                status: decision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
                reviewed_by: reviewerId,
                reviewed_at: new Date().toISOString(),
                remarks: remarks
            })
            .eq('id', exemptionId);

        if (updateExError) throw new Error(updateExError.message);

        // 3. Update History & App status if needed
        const newHistoryStatus = decision === 'APPROVE' ? ADMISSION_STATUS.PET_EXEMPTION_APPROVED : ADMISSION_STATUS.PET_EXEMPTION_REJECTED;
        await createHistory(exemption.application_id, newHistoryStatus, reviewerId, `PET Exemption ${decision}: ${remarks}`);

        // Note: Logic for "bypassing PET exam" usually means the application proceeds to the next step
        // In this system, SCRUTINY_APPROVED seems to be the trigger for Interview Scheduling.
        // If an exemption is approved, and scrutiny is already approved, it's already on track.
        // If scrutiny is NOT yet approved, it will continue normally but might be marked as exempted later.
        // For simplicity, we just log the status here. The business logic for scheduling will skip PET check if this record exists and is APPROVED.

        return { success: true };
    },

    getPendingPetExemptions: async () => {
        const { data, error } = await supabase
            .from('admission_pet_exemptions')
            .select(`
                *,
                admission_applications (
                    reference_number,
                    payload,
                    applicant_id
                )
            `)
            .eq('status', 'PENDING');

        if (error) throw new Error(error.message);
        return data;
    },

    generateAllocationCertificate: async (applicationId: string, issuerId: string) => {
        // 1. Verify eligibility
        const app = await AdmissionService.getApplicationById(applicationId);
        if (!app) throw new Error('Application not found');
        if (app.status !== ADMISSION_STATUS.GUIDE_ALLOCATED) {
            throw new Error('Guide is not yet allocated for this application.');
        }

        // 2. Check if already exists
        const { data: existing } = await supabase
            .from('admission_allocation_certificates')
            .select('id')
            .eq('application_id', applicationId)
            .single();

        if (existing) throw new Error('Certificate already generated.');

        // 3. Generate Certificate Details
        const certNumber = `GAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        // Simulation: In a real app, we'd use a PDF lib here and upload to S3/Supabase Storage
        const mockFileUrl = `https://storage.university.edu/admission/certificates/${certNumber}.pdf`;

        // 4. Insert Record
        const { error: insertError } = await supabase
            .from('admission_allocation_certificates')
            .insert({
                application_id: applicationId,
                certificate_number: certNumber,
                issued_by: issuerId,
                file_url: mockFileUrl
            });

        if (insertError) throw new Error(insertError.message);

        // 5. History & Audit
        await createHistory(applicationId, app.status, issuerId, `Guide Allocation Certificate Issued: ${certNumber}`);

        return { success: true, certificate_number: certNumber, file_url: mockFileUrl };
    },

    getCertificateByApplicationId: async (applicationId: string) => {
        const { data, error } = await supabase
            .from('admission_allocation_certificates')
            .select('*')
            .eq('application_id', applicationId)
            .single();

        if (error && error.code !== 'PGRST116') throw new Error(error.message);
        return data;
    },

    submitStudentGuideAcceptance: async (applicationId: string, userId: string) => {
        // 1. Validate application
        const app = await AdmissionService.getApplicationById(applicationId);
        if (!app) throw new Error('Application not found');
        if (app.status !== ADMISSION_STATUS.GUIDE_ALLOCATED) {
            throw new Error('Application is not in Guide Allocated stage.');
        }

        // 2. Upsert acceptance record
        const { error: upsertError } = await supabase
            .from('admission_guide_acceptance')
            .upsert({
                application_id: applicationId,
                student_acceptance: true,
                student_accepted_at: new Date().toISOString()
            }, { onConflict: 'application_id' });

        if (upsertError) throw new Error(upsertError.message);

        // 3. Update Application Status
        const { error: statusError } = await supabase
            .from('admission_applications')
            .update({ status: ADMISSION_STATUS.GUIDE_ACCEPTED_BY_STUDENT, updated_at: new Date().toISOString() })
            .eq('id', applicationId);

        if (statusError) throw new Error('Failed to update application status');

        // 4. History
        await createHistory(applicationId, ADMISSION_STATUS.GUIDE_ACCEPTED_BY_STUDENT, userId, 'Guide accepted by student.');

        return { success: true };
    },

    submitGuideAcceptance: async (applicationId: string, decision: 'ACCEPT' | 'REJECT', remarks: string, guideId: string) => {
        // 1. Validate application
        const app = await AdmissionService.getApplicationById(applicationId);
        if (!app) throw new Error('Application not found');

        // Ensure student has accepted first or allow guide to accept if status is GUIDE_ALLOCATED? 
        // Logic says student accepts first usually. Let's check status.
        if (app.status !== ADMISSION_STATUS.GUIDE_ACCEPTED_BY_STUDENT) {
            throw new Error('Student has not yet accepted the guide allocation.');
        }

        const newStatus = decision === 'ACCEPT' ? ADMISSION_STATUS.ADMISSION_CONFIRMED : ADMISSION_STATUS.REJECTED; // Or escalate to DRC? "escalate to DRC" might mean a special status or just REJECTED/REALLOCATE

        // 2. Update acceptance record
        const { error: updateError } = await supabase
            .from('admission_guide_acceptance')
            .update({
                guide_acceptance: decision === 'ACCEPT',
                guide_accepted_at: new Date().toISOString(),
                remarks: remarks
            })
            .eq('application_id', applicationId);

        if (updateError) throw new Error(updateError.message);

        // 3. Update Application Status
        const { error: statusError } = await supabase
            .from('admission_applications')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', applicationId);

        if (statusError) throw new Error('Failed to update application status');

        // 4. History
        await createHistory(applicationId, newStatus, guideId, `Guide ${decision}ED: ${remarks}`);

        return { success: true };
    }
};

async function createHistory(appId: string, status: string, by: string, remarks: string) {
    await supabase.from('admission_status_history').insert({
        application_id: appId,
        new_status: status,
        changed_by: by,
        remarks: remarks
    });
}
