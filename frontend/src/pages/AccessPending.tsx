import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, LogOut } from 'lucide-react';

const AccessPending: React.FC = () => {
    const { logout, user } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="h-20 w-20 bg-orange-100 rounded-full flex items-center justify-center animate-pulse">
                        <ShieldAlert className="h-10 w-10 text-orange-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Access Pending</h1>

                <p className="text-muted-foreground">
                    Your account (<span className="font-medium text-foreground">{user?.email}</span>) exists on the platform,
                    but no system role has been assigned to you yet.
                </p>

                <div className="bg-white p-4 rounded-lg border shadow-sm text-sm text-left">
                    <p className="font-semibold mb-2">Possible Reasons:</p>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>Your application is still being processed.</li>
                        <li>An administrator has not yet activated your role.</li>
                        <li>This is a new account awaiting configuration.</li>
                    </ul>
                </div>

                <div className="pt-4">
                    <Button onClick={() => logout()} variant="outline" className="w-full">
                        <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AccessPending;
