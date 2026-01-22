import { ADMISSION_STATUS, APPLICATION_TYPE, CANDIDATE_TYPE } from './admission.constants';

export type CandidateType = keyof typeof CANDIDATE_TYPE;

export interface AdmissionApplication {
    id: string;
    applicant_id?: string | null;
    application_type: 'PET';
    candidate_type: CandidateType;
    status: keyof typeof ADMISSION_STATUS;
    payload: PetApplicationInput;
    external_applicant_snapshot?: ExternalApplicantSnapshot;
    reference_number: string;
    created_at: string;
    updated_at: string;
}

export interface ExternalApplicantSnapshot {
    email: string;
    mobile: string;
    identity_document: string;
    full_name: string;
}

export interface PetApplicationInput {
    candidate_type: CandidateType;
    email?: string;
    mobile?: string;
    identity_document?: string;

    personal_details: {
        full_name: string;
        dob: string;
        gender: string;
        contact_number: string;
        address: string;
    };
    academic_details: {
        qualifying_degree: string;
        university: string;
        year_of_passing: number;
        percentage: number;
    };
    research_interest: {
        area_of_interest: string;
        proposed_topic?: string;
    };
    category: string;
    is_exemption_requested: boolean;
}

export interface ScrutinyDecisionInput {
    decision: 'APPROVE' | 'REJECT';
    remarks: string;
}

export interface InterviewScheduleInput {
    interview_date: string;
    interview_mode: 'ONLINE' | 'OFFLINE';
    interview_location?: string;
    panel_members: string[]; // List of names
}

export interface InterviewEvaluationInput {
    evaluation_score: number;
    recommendation: 'PASS' | 'FAIL';
    remarks?: string;
}

export interface DocumentVerificationInput {
    verification_status: 'VERIFIED' | 'REJECTED';
    remarks: string;
}

export interface FeePaymentInput {
    amount: number;
    payment_reference: string;
    payment_mode: 'ONLINE' | 'OFFLINE';
}

export interface GuideAllocationInput {
    guide_faculty_id: string; // Faculty UUID or ID
    remarks?: string;
}

export interface PetExemptionInput {
    application_id: string;
    exemption_reason: string;
    supporting_documents: string[]; // URLs or References
}

export interface PetExemptionReviewInput {
    decision: 'APPROVE' | 'REJECT';
    remarks: string;
}

