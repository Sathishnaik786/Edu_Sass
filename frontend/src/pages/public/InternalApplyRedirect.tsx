
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from "@/components/ui/skeleton";

const InternalApplyRedirect: React.FC = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (user) {
                // If authenticated: redirect to admission dashboard
                navigate('/admission/dashboard');
            } else {
                // If NOT authenticated: redirect to login with redirect param
                navigate('/login?redirect=/admission/dashboard');
            }
        }
    }, [user, loading, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="space-y-4 w-[300px]">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
    );
};

export default InternalApplyRedirect;
