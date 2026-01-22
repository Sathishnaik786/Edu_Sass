import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import AdmissionRoutes from './routes/admission.routes';

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

                {/* Secure Application Routes */}
                <Route path="/admission" element={<DashboardLayout />}>
                    <Route element={<ProtectedRoute />}>
                        <Route path="*" element={<AdmissionRoutes />} />
                    </Route>
                </Route>
            </Routes>
        </AuthProvider>
    );
}

export default App;
