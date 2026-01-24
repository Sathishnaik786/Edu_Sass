import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';

import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/public/LandingPage';
import AdmissionsPage from './pages/public/AdmissionsPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import ApplySelectionPage from './pages/public/Apply';
import InternalApplyRedirect from './pages/public/InternalApplyRedirect';
import ExternalApplyPage from './pages/public/PublicExternalApply';

// Admission Module Imports
import ApplyPage from './modules/admission/pages/Apply';
import StatusPage from './modules/admission/pages/Status';
import ScrutinyList from './modules/admission/pages/ScrutinyList';
import ScrutinyReview from './modules/admission/pages/ScrutinyReview';
import InterviewList from './modules/admission/pages/InterviewList';
import InterviewSchedule from './modules/admission/pages/InterviewSchedule';
import InterviewEvaluationList from './modules/admission/pages/InterviewEvaluationList';
import InterviewEvaluationForm from './modules/admission/pages/InterviewEvaluationForm';
import DocumentVerificationList from './modules/admission/pages/DocumentVerificationList';
import DocumentVerificationAction from './modules/admission/pages/DocumentVerificationAction';
import FeePaymentForm from './modules/admission/pages/FeePaymentForm';
import GuideAllocationList from './modules/admission/pages/GuideAllocationList';
import GuideAllocationForm from './modules/admission/pages/GuideAllocationForm';
import MyApplications from './modules/admission/pages/MyApplications';
import UserProfile from './modules/admission/pages/UserProfile';
import DRCDashboard from './modules/admission/pages/DRCDashboard';
import AdminDashboard from './modules/admission/pages/AdminDashboard';
import PetExemptionRequest from './modules/admission/pages/PetExemptionRequest';
import PetExemptionReview from './modules/admission/pages/PetExemptionReview';
import StudentGuideAcceptance from './modules/admission/pages/StudentGuideAcceptance';
import AccessPending from './pages/AccessPending';
import AdminIntake from './modules/admission/pages/AdminIntake';
import { FeeVerification } from './modules/admission/pages/drc/FeeVerification';
import GuideVerificationDashboard from './modules/admission/pages/guide/GuideVerificationDashboard';
import GuideScholars from './modules/admission/pages/guide/GuideScholars';

function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/admissions" element={<AdmissionsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* New PhD Application Flow */}
                <Route path="/apply" element={<ApplySelectionPage />} />
                <Route path="/apply/internal" element={<InternalApplyRedirect />} />
                <Route path="/apply/external" element={<ExternalApplyPage />} />

                <Route path="/login" element={<LoginPage />} />
                <Route path="/access-pending" element={<AccessPending />} />

                {/* Secure Application Routes */}
                <Route path="/admission" element={<DashboardLayout />}>

                    {/* Publicly accessible within dashboard (e.g. Profile) - Any Role */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="profile" element={<UserProfile />} />
                        <Route path="status" element={<StatusPage />} />
                        <Route path="dashboard" element={<StatusPage />} />
                    </Route>

                    {/* APPLICANT ONLY */}
                    <Route element={<ProtectedRoute allowedRoles={['APPLICANT']} />}>
                        <Route path="apply" element={<ApplyPage forcedType="INTERNAL" />} />
                        <Route path="applications" element={<MyApplications />} />

                        {/* Student Actions */}
                        <Route path="fees/pay/:id" element={<FeePaymentForm />} />
                        <Route path="student-accept/:id" element={<StudentGuideAcceptance />} />
                        <Route path="pet/exemption" element={<PetExemptionRequest />} />
                    </Route>

                    {/* ADMIN ONLY */}
                    <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
                        <Route path="admin/overview" element={<AdminDashboard />} />
                        <Route path="admin/intake" element={<AdminIntake />} />
                    </Route>

                    {/* DRC & ADMIN Shared Operations */}
                    <Route element={<ProtectedRoute allowedRoles={['DRC', 'ADMIN', 'SUPER_ADMIN']} />}>
                        <Route path="overview" element={<DRCDashboard />} />
                        <Route path="scrutiny" element={<ScrutinyList />} />
                        <Route path="scrutiny/:id" element={<ScrutinyReview />} />
                        <Route path="pet/exemption/review" element={<PetExemptionReview />} />

                        <Route path="guides" element={<GuideAllocationList />} />
                        <Route path="guides/allocate/:id" element={<GuideAllocationForm />} />

                        <Route path="interviews" element={<InterviewList />} />
                        <Route path="interviews/schedule/:id" element={<InterviewSchedule />} />
                        <Route path="interviews/evaluation" element={<InterviewEvaluationList />} />
                        <Route path="interviews/evaluate/:id" element={<InterviewEvaluationForm />} />

                        <Route path="verification" element={<DocumentVerificationList />} />
                        <Route path="verification/:id" element={<DocumentVerificationAction />} />

                        <Route path="fees/verification" element={<FeeVerification />} />
                    </Route>

                    {/* FACULTY / GUIDE ONLY */}
                    <Route element={<ProtectedRoute allowedRoles={['FACULTY', 'GUIDE']} />}>
                        <Route path="guide/verification" element={<GuideVerificationDashboard />} />
                        <Route path="guide/scholars" element={<GuideScholars />} />
                    </Route>
                </Route>
            </Routes>
        </AuthProvider>
    );
}

export default App;
