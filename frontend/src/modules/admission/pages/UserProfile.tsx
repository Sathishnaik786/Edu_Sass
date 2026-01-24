
import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const UserProfile: React.FC = () => {
    const { user, logout, authRole } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="User Profile"
                description="View your account details and current role permissions."
            />

            <div className="bg-card border rounded-xl p-6 md:p-8 max-w-2xl shadow-sm">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 border-b pb-8">
                    <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary border-4 border-background shadow-lg text-4xl font-bold ring-1 ring-border">
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-2 flex-1">
                        <h3 className="text-2xl font-bold tracking-tight">{user?.email?.split('@')[0]}</h3>
                        <div className="flex flex-col gap-1">
                            <p className="text-muted-foreground flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4" /> {user?.email}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                    <Shield className="h-3 w-3" />
                                    {authRole || 'NO_ROLE'}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="space-y-6">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-foreground">Account ID</label>
                        <div className="p-3 bg-muted/50 rounded-md border font-mono text-xs text-muted-foreground break-all">
                            {user?.id}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Display Name</label>
                        <div className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm">
                            <User className="mr-2 h-4 w-4 text-muted-foreground" />
                            <input
                                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground cursor-default"
                                value={user?.user_metadata?.name || user?.email?.split('@')[0]}
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="pt-6 mt-6 border-t flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                            To update your password or profile details, please contact the system administrator.
                        </p>
                        <Button
                            variant="destructive"
                            onClick={handleLogout}
                            className="gap-2 shrink-0"
                        >
                            <LogOut className="h-4 w-4" /> Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
