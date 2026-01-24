import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { user, role, loading } = useAuth();

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Verifying access...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
        console.warn(`[Access Denied] User '${user.id}' role '${role}' not in allowed list:`, allowedRoles);
        return <div className="p-12 text-center text-red-500 font-bold">Access Denied: Insufficient Permissions</div>;
    }

    return <Outlet />;
};

export default ProtectedRoute;
