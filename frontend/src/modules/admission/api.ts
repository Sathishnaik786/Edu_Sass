import axios from 'axios';
import { supabase } from '@/lib/supabase';

// 1. Fixed Axios Instance with Correct Base URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003/api/admission',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 2. Request Interceptor (Auth Token)
api.interceptors.request.use(async (config) => {
    try {
        if (!config.headers) {
            config.headers = {} as any;
        }

        console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`);

        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    } catch (error) {
        return Promise.reject(error);
    }
}, (error) => Promise.reject(error));

// 3. Response Interceptor (Logging & Error Handling)
api.interceptors.response.use(
    (response) => {
        console.log(`[Response] ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('[Response Error]', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        return Promise.reject(error);
    }
);

export const admissionApi = {
    // PET Application
    createPetApplication: async (data: any, isInternal: boolean) => {
        // Returns the response body directly to match Apply.tsx expectations
        return api.post('/pet/apply', data).then(res => res.data);
    },

    getApplicationStatus: async (referenceNumber: string) => {
        return api.get(`/pet/status/${referenceNumber}`).then(res => res.data);
    },

    getMyApplications: async () => {
        return api.get('/my-applications').then(res => res.data);
    },

    getApplicationById: async (id: string) => {
        return api.get(`/applications/${id}`).then(res => res.data);
    },

    getTimeline: async (applicationId: string) => {
        return api.get(`/applications/${applicationId}/timeline`).then(res => res.data);
    },

    // Scrutiny
    getPendingScrutiny: async () => {
        return api.get('/scrutiny/pending').then(res => res.data);
    },

    submitScrutinyDecision: async (applicationId: string, decision: 'APPROVE' | 'REJECT', remarks: string) => {
        return api.post(`/scrutiny/${applicationId}/decision`, { decision, remarks }).then(res => res.data);
    },

    // Interview
    getEligibleInterviews: async () => {
        return api.get('/interviews/eligible').then(res => res.data);
    },

    scheduleInterview: async (applicationId: string, schedule: any) => {
        return api.post(`/interviews/${applicationId}/schedule`, schedule).then(res => res.data);
    },

    // Evaluation
    getPendingEvaluations: async () => {
        return api.get('/interviews/evaluation/pending').then(res => res.data);
    },

    submitEvaluation: async (interviewId: string, payload: any) => {
        return api.post(`/interviews/${interviewId}/evaluate`, payload).then(res => res.data);
    },

    // Document Verification
    getPendingVerifications: async () => {
        return api.get('/verification/pending').then(res => res.data);
    },

    submitVerification: async (applicationId: string, payload: any) => {
        return api.post(`/verification/${applicationId}/submit`, payload).then(res => res.data);
    },

    // Fees
    getPendingFees: async () => {
        return api.get('/fees/pending').then(res => res.data);
    },

    payFee: async (applicationId: string, payload: any) => {
        return api.post(`/fees/${applicationId}/pay`, payload).then(res => res.data);
    },

    // New Fee Payment Flow (Phase-FR-007)
    initiateFeePayment: async (applicationId: string) => {
        return api.post('/fee/initiate', { applicationId }).then(res => res.data);
    },

    confirmFeePayment: async (applicationId: string, transactionReference: string) => {
        return api.post('/fee/confirm', { applicationId, transactionReference }).then(res => res.data);
    },

    getFeeInfo: async (applicationId: string) => {
        return api.get(`/fee/${applicationId}`).then(res => res.data);
    },

    // Guides
    getAvailableGuides: async () => {
        return api.get('/guides/available').then(res => res.data);
    },

    getPendingGuides: async () => {
        return api.get('/guides/pending').then(res => res.data);
    },

    allocateGuide: async (applicationId: string, payload: any) => {
        return api.post(`/guides/${applicationId}/allocate`, payload).then(res => res.data);
    },

    getGuideAllocation: async (applicationId: string) => {
        return api.get(`/guide/${applicationId}`).then(res => res.data);
    },

    acceptGuide: async (payload: any) => {
        return api.post('/guide/accept', payload).then(res => res.data);
    },

    getGuideAcceptance: async (applicationId: string) => {
        return api.get(`/guide/acceptance/${applicationId}`).then(res => res.data);
    },

    verifyGuide: async (payload: any) => {
        return api.post('/guide/verify', payload).then(res => res.data);
    },

    getPendingGuideVerifications: async () => {
        return api.get('/guide/pending_verification').then(res => res.data);
    },

    getGuideScholars: async () => {
        return api.get('/guide/scholars').then(res => res.data);
    },

    // Fee Verification (DRC)
    getPendingFeeVerifications: async () => {
        return api.get('/fees/pending?type=verification').then(res => res.data);
    },

    verifyFeePayment: async (payload: { applicationId: string, remark: string }) => {
        return api.post(`/fee/${payload.applicationId}/verify`, { remark: payload.remark }).then(res => res.data);
    },

    getAllApplications: async () => {
        return api.get('/applications').then(res => res.data);
    },

    // PET Exemption
    requestPetExemption: async (payload: any) => {
        return api.post('/pet/exemption/request', payload).then(res => res.data);
    },

    getPendingExemptions: async () => {
        return api.get('/pet/exemption/pending').then(res => res.data);
    },

    reviewPetExemption: async (exemptionId: string, payload: any) => {
        return api.post(`/pet/exemption/${exemptionId}/review`, payload).then(res => res.data);
    },

    // Guide Allocation Certificate
    generateCertificate: async (applicationId: string) => {
        return api.post(`/applications/${applicationId}/certificate`).then(res => res.data);
    },

    getCertificate: async (applicationId: string) => {
        return api.get(`/applications/${applicationId}/certificate`).then(res => res.data);
    },

    // Guide Acceptance
    submitStudentGuideAcceptance: async (applicationId: string) => {
        return api.post(`/applications/${applicationId}/student-accept`).then(res => res.data);
    },

    submitGuideAcceptance: async (applicationId: string, payload: { decision: 'ACCEPT' | 'REJECT', remarks: string }) => {
        return api.post(`/applications/${applicationId}/guide-confirm`, payload).then(res => res.data);
    },

    // Intake (Admin)
    getPendingIntake: async () => {
        return api.get('/intake/pending').then(res => res.data);
    },

    approveIntake: async (applicationId: string) => {
        return api.post(`/intake/${applicationId}/approve`).then(res => res.data);
    },

    rejectIntake: async (applicationId: string) => {
        return api.post(`/intake/${applicationId}/reject`).then(res => res.data);
    }
};
