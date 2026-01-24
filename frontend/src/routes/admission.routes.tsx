import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ApplyPage from '../modules/admission/pages/Apply';
import StatusPage from '../modules/admission/pages/Status';
import ScrutinyList from '../modules/admission/pages/ScrutinyList';
import ScrutinyReview from '../modules/admission/pages/ScrutinyReview';
import InterviewList from '../modules/admission/pages/InterviewList';
import InterviewSchedule from '../modules/admission/pages/InterviewSchedule';
import InterviewEvaluationList from '../modules/admission/pages/InterviewEvaluationList';
import InterviewEvaluationForm from '../modules/admission/pages/InterviewEvaluationForm';
import DocumentVerificationList from '../modules/admission/pages/DocumentVerificationList';
import DocumentVerificationAction from '../modules/admission/pages/DocumentVerificationAction';
import FeePaymentList from '../modules/admission/pages/FeePaymentList';
import FeePaymentForm from '../modules/admission/pages/FeePaymentForm';
import GuideAllocationList from '../modules/admission/pages/GuideAllocationList';
import GuideAllocationForm from '../modules/admission/pages/GuideAllocationForm';
import MyApplications from '../modules/admission/pages/MyApplications';
import UserProfile from '../modules/admission/pages/UserProfile';
import DRCDashboard from '../modules/admission/pages/DRCDashboard';
import AdminDashboard from '../modules/admission/pages/AdminDashboard';
import PetExemptionRequest from '../modules/admission/pages/PetExemptionRequest';
import PetExemptionReview from '../modules/admission/pages/PetExemptionReview';
import StudentGuideAcceptance from '../modules/admission/pages/StudentGuideAcceptance';
import GuideConfirmation from '../modules/admission/pages/GuideConfirmation';

const AdmissionRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="overview" element={<DRCDashboard />} />
            <Route path="admin/overview" element={<AdminDashboard />} />
            <Route path="dashboard" element={<StatusPage />} />
            <Route path="apply" element={<ApplyPage forcedType="INTERNAL" />} />
            <Route path="status" element={<StatusPage />} />
            <Route path="applications" element={<MyApplications />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="scrutiny" element={<ScrutinyList />} />
            <Route path="scrutiny/:id" element={<ScrutinyReview />} />
            <Route path="interviews" element={<InterviewList />} />
            <Route path="interviews/schedule/:id" element={<InterviewSchedule />} />
            <Route path="interviews/evaluation" element={<InterviewEvaluationList />} />
            <Route path="interviews/evaluate/:id" element={<InterviewEvaluationForm />} />
            <Route path="verification" element={<DocumentVerificationList />} />
            <Route path="verification/:id" element={<DocumentVerificationAction />} />
            <Route path="fees" element={<FeePaymentList />} />
            <Route path="fees/pay/:id" element={<FeePaymentForm />} />
            <Route path="guides" element={<GuideAllocationList />} />
            <Route path="guides/allocate/:id" element={<GuideAllocationForm />} />
            <Route path="pet/exemption" element={<PetExemptionRequest />} />
            <Route path="pet/exemption/review" element={<PetExemptionReview />} />
            <Route path="student-accept/:id" element={<StudentGuideAcceptance />} />
            <Route path="guide-confirm/:id" element={<GuideConfirmation />} />
            <Route path="*" element={<div>Admission 404</div>} />
        </Routes>
    );
};

export default AdmissionRoutes;
