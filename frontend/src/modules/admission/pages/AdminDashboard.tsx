
import React, { useEffect, useState } from 'react';
import { admissionApi } from '../api';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '../components/StatusBadge';
import {
    Users,
    FileText,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

interface DashboardStats {
    totalApplications: number;
    pendingScrutiny: number;
    interviewsScheduled: number;
    pendingVerification: number;
    admitted: number;
    recentActivity: any[];
    statusCounts: Record<string, number>;
}

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalApplications: 0,
        pendingScrutiny: 0,
        interviewsScheduled: 0,
        pendingVerification: 0,
        admitted: 0,
        recentActivity: [],
        statusCounts: {}
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await admissionApi.getAllApplications();
                if (res.success) {
                    const apps = res.data || [];

                    // Calc Stats
                    const pendingScrutiny = apps.filter((a: any) => a.status === 'SUBMITTED' || a.status === 'UNDER_SCRUTINY').length;
                    const interviews = apps.filter((a: any) => a.status === 'INTERVIEW_SCHEDULED').length;
                    const pendingVerif = apps.filter((a: any) => ['FEE_VERIFICATION_PENDING', 'GUIDE_ACCEPTED_BY_APPLICANT'].includes(a.status)).length;
                    const admitted = apps.filter((a: any) => a.status === 'ADMISSION_CONFIRMED').length;

                    // Status Counts
                    const counts: Record<string, number> = {};
                    apps.forEach((a: any) => {
                        counts[a.status] = (counts[a.status] || 0) + 1;
                    });

                    setStats({
                        totalApplications: apps.length,
                        pendingScrutiny,
                        interviewsScheduled: interviews,
                        pendingVerification: pendingVerif,
                        admitted,
                        recentActivity: apps.slice(0, 10), // Top 10 recent
                        statusCounts: counts
                    });
                }
            } catch (error) {
                console.error("Failed to load admin dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatStatusLabel = (status: string) => {
        return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="Admin Overview"
                description="Executive summary of the entire admission lifecycle."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {loading ? (
                    Array(5).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))
                ) : (
                    <>
                        <StatCard
                            label="Total Applications"
                            value={stats.totalApplications}
                            icon={FileText}
                            description="All time"
                        />
                        <StatCard
                            label="Pending Scrutiny"
                            value={stats.pendingScrutiny}
                            icon={AlertCircle}
                            description="Action required"
                            className="border-orange-200 bg-orange-50/10"
                        />
                        <StatCard
                            label="Interviews Scheduled"
                            value={stats.interviewsScheduled}
                            icon={Users}
                            description="Upcoming"
                        />
                        <StatCard
                            label="Pending Verification"
                            value={stats.pendingVerification}
                            icon={CheckCircle2}
                            description="Final Stage"
                        />
                        <StatCard
                            label="Admitted"
                            value={stats.admitted}
                            icon={TrendingUp}
                            description="Successfully enrolled"
                            className="border-green-200 bg-green-50/10"
                        />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-muted-foreground" />
                            Recent Application Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-14 w-full" />)}
                            </div>
                        ) : stats.recentActivity.length === 0 ? (
                            <EmptyState
                                title="No Activity"
                                description="No applications have been submitted yet."
                                className="min-h-[200px]"
                            />
                        ) : (
                            <div className="space-y-1">
                                {stats.recentActivity.map((app) => (
                                    <div key={app.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors border-b last:border-0 border-border/50">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">{app.reference_number}</span>
                                                {app.candidate_type === 'EXTERNAL' && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
                                                        External
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(app.created_at).toLocaleDateString()} at {new Date(app.created_at).toLocaleTimeString()}
                                            </span>
                                            {app.candidate_type === 'EXTERNAL' && !app.applicant_id && (
                                                <span className="text-xs text-blue-600 font-medium">Pending Approval</span>
                                            )}
                                        </div>
                                        <StatusBadge status={app.status} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Status Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-8" /></div>
                                        <Skeleton className="h-2 w-full" />
                                    </div>
                                ))}
                            </div>
                        ) : Object.keys(stats.statusCounts).length === 0 ? (
                            <p className="text-muted-foreground text-sm">No data available.</p>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(stats.statusCounts).map(([status, count]) => (
                                    <div key={status} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground font-medium uppercase tracking-wider">{formatStatusLabel(status)}</span>
                                            <span className="font-bold">{count}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-500"
                                                style={{ width: `${Math.min((count / stats.totalApplications) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;

