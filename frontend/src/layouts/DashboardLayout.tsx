import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppNavbar } from '@/components/common/AppNavbar';
import { AppSidebar, MenuItem } from '@/components/common/AppSidebar';
import {
    LayoutDashboard,
    FileText,
    Search,
    Users,
    FileCheck,
    CreditCard,
    User,
    ClipboardCheck,
    BookOpen,
    UserPlus,
    CheckCircle2
} from 'lucide-react';

const adminItems: MenuItem[] = [
    { label: 'Overview', icon: LayoutDashboard, path: '/admission/admin/overview' },
    { label: 'External Intake', icon: UserPlus, path: '/admission/admin/intake', badge: 'New' },
    { label: 'DRC Dashboard', icon: LayoutDashboard, path: '/admission/overview' },
    { label: 'Scrutiny', icon: Search, path: '/admission/scrutiny' },
    { label: 'Interviews', icon: Users, path: '/admission/interviews' },
    { label: 'Evaluation', icon: ClipboardCheck, path: '/admission/interviews/evaluation' },
    { label: 'Verification', icon: FileCheck, path: '/admission/verification' },
    { label: 'Guide Allocation', icon: BookOpen, path: '/admission/guides' },
    { label: 'Profile', icon: User, path: '/admission/profile' },
];

const studentItems: MenuItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admission/status' },
    { label: 'Applications', icon: FileText, path: '/admission/applications' },
    { label: 'My Profile', icon: User, path: '/admission/profile' },
];

const DashboardLayout: React.FC = () => {
    const { user, logout, authRole } = useAuth();
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Transform auth user to Navbar user format
    const navbarUser = user ? {
        name: user.email?.split('@')[0] || 'User',
        role: authRole || 'NO_ROLE', // Use DB Role Context
        avatarUrl: user.user_metadata?.avatar_url
    } : undefined;

    // Strict Role Check - No fallbacks
    const isAdmin = authRole === 'ADMIN' || authRole === 'SUPER_ADMIN';
    const isDRC = authRole === 'DRC';
    const isApplicant = authRole === 'APPLICANT';

    // Determined Items based on Role
    let currentItems: MenuItem[] = [];
    const isFaculty = authRole === 'FACULTY' || authRole === 'GUIDE';

    const facultyItems: MenuItem[] = [
        { label: 'Pending Verifications', icon: CheckCircle2, path: '/admission/guide/verification', badge: 'Action' },
        { label: 'My Scholars', icon: Users, path: '/admission/guide/scholars' },
        { label: 'Profile', icon: User, path: '/admission/profile' },
    ];

    if (isAdmin) currentItems = adminItems;
    else if (isDRC) currentItems = adminItems;
    else if (isFaculty) currentItems = facultyItems;
    else if (isApplicant) currentItems = studentItems;
    // Default empty if NO_ROLE

    return (
        <div className="min-h-screen bg-muted/20 flex flex-col">
            <AppNavbar
                user={navbarUser}
                onLogout={handleLogout}
                brandName="EduERP Adm"
                onProfileClick={() => navigate('/admission/status')}
            />

            <div className="flex flex-1 relative">
                {/* 
                    Sidebar:
                    - Hidden on mobile by default (handled by CSS/Responsiveness if we add a toggle)
                    - For now, we will handle responsive hiding or leave it as is per instructions "Sidebar collapses on mobile"
                    - The AppSidebar component handles internal collapse state, but for mobile we might want to hide it completely or overlay.
                    - Given the prompt "Responsive behavior: Sidebar collapses on mobile", the AppSidebar already has collapse logic. 
                    - However, meaningful mobile responsiveness often means converting to a drawer or hiding.
                    - We will stick to the default behavior of AppSidebar but ensure it fits well.
                */}
                <AppSidebar
                    items={currentItems}
                    collapsed={sidebarCollapsed}
                    onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="h-[calc(100vh-4rem)] sticky top-16 hidden md:flex border-none"
                />

                <main className="flex-1 w-full p-4 md:p-6 lg:p-8 overflow-x-hidden">
                    {/* Mobile Menu Toggle could go here if we wanted a separate mobile drawer */}
                    <div className="mx-auto max-w-6xl animate-in fade-in duration-500">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
