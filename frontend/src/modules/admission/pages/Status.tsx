import React, { useEffect, useState } from 'react';
import { admissionApi } from '../api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { ApplicationTimeline } from '../components/ApplicationTimeline';
import { FileText, Search, Bell, Clock, ArrowRight, Download, CheckCircle2 } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '../components/StatusBadge';

const StatusPage: React.FC = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState<any[]>([]);
    const [refNumber, setRefNumber] = useState('');
    const [searchedApp, setSearchedApp] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [certificate, setCertificate] = useState<any>(null);

    useEffect(() => {
        const fetchInternalApps = async () => {
            try {
                const res = await admissionApi.getMyApplications();
                if (res.success) {
                    setApplications(res.data);

                    // If latest app is GUIDE_ALLOCATED, try to get certificate
                    const latest = res.data[0];
                    if (latest && latest.status === 'GUIDE_ALLOCATED') {
                        const certRes = await admissionApi.getCertificate(latest.id).catch(() => null);
                        if (certRes && certRes.success) {
                            setCertificate(certRes.data);
                        }
                    }
                }
            } catch (error) {
                // Ignore silent fail for now
            } finally {
                setLoading(false);
            }
        };
        fetchInternalApps();
    }, []);

    const handleSearch = async () => {
        if (!refNumber) return;
        try {
            const res = await admissionApi.getApplicationStatus(refNumber);
            if (res.success) {
                setSearchedApp(res.data);
            } else {
                setSearchedApp(null);
                alert('Application not found');
            }
        } catch (error) {
            setSearchedApp(null);
            alert('Application not found');
        }
    };

    // Derived State
    const recentApp = applications.length > 0 ? applications[0] : null;
    const pendingCount = applications.filter(a => !a.status.includes('REJECTED') && !a.status.includes('ADMITTED')).length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title={`Welcome back, ${user?.email?.split('@')[0] || 'Scholar'}`}
                description="Track your PhD application status and manage your admission journey."
                actions={
                    <div className="flex gap-3">
                        {recentApp?.status === 'GUIDE_ALLOCATED' && (
                            <Button
                                variant="outline"
                                className="gap-2 border-primary text-primary hover:bg-primary/5 shadow-sm"
                                onClick={() => {
                                    if (certificate?.file_url) {
                                        window.open(certificate.file_url, '_blank');
                                    } else {
                                        alert('Certificate is being generated. Please check back in a few minutes.');
                                    }
                                }}
                            >
                                <Download className="h-4 w-4" /> Download Allocation Letter
                            </Button>
                        )}
                        {recentApp?.status === 'GUIDE_ALLOCATED' && (
                            <Link to={`/admission/student-accept/${recentApp.id}`}>
                                <Button
                                    className="gap-2 bg-amber-600 hover:bg-amber-700 shadow-sm"
                                >
                                    <CheckCircle2 className="h-4 w-4" /> Accept Guide Allocation
                                </Button>
                            </Link>
                        )}
                        <Link to="/admission/apply">
                            <Button className="gap-2 shadow-sm"><FileText className="h-4 w-4" /> Start New Application</Button>
                        </Link>
                    </div>
                }
            />

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))
                ) : (
                    <>
                        <StatCard
                            label="Active Applications"
                            value={pendingCount}
                            icon={FileText}
                            description="In progress"
                        />
                        <StatCard
                            label="Notifications"
                            value="0"
                            icon={Bell}
                            description="No new alerts"
                        />
                        <StatCard
                            label="Next Deadline"
                            value="Mar 15"
                            icon={Clock}
                            description="PET Examination"
                        />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Recent Application Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="h-full border-border shadow-sm">
                        <CardHeader className="pb-3 border-b">
                            {loading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-1/3" />
                                    <Skeleton className="h-4 w-1/4" />
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Recent Application Activity</CardTitle>
                                        <CardDescription>
                                            {recentApp ? `Reference: ${recentApp.reference_number}` : 'No active applications found.'}
                                        </CardDescription>
                                    </div>
                                    {recentApp && <StatusBadge status={recentApp.status} />}
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="pt-8 transition-all">
                            {loading ? (
                                <div className="space-y-8">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="flex gap-4">
                                            <Skeleton className="h-6 w-6 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-1/4" />
                                                <Skeleton className="h-3 w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : recentApp ? (
                                <ApplicationTimeline
                                    status={recentApp.status}
                                    createdAt={recentApp.created_at}
                                />
                            ) : (
                                <div className="text-center py-12">
                                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-semibold text-lg">No Applications Yet</h3>
                                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                        Start your journey by applying for the PhD Entrance Test (PET).
                                    </p>
                                    <Link to="/admission/apply">
                                        <Button>Apply Now <ArrowRight className="ml-2 h-4 w-4" /></Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: External Search & Quick Links */}
                <div className="space-y-6">
                    <Card className="bg-muted/30 border-dashed">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Search className="h-4 w-4" /> Track External Application
                            </CardTitle>
                            <CardDescription>Check status via Reference Number</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Ref # (e.g. PET-2024-X)"
                                    value={refNumber}
                                    onChange={(e) => setRefNumber(e.target.value)}
                                    className="bg-background"
                                />
                                <Button onClick={handleSearch} variant="secondary">Go</Button>
                            </div>
                            {searchedApp && (
                                <div className="p-3 border rounded-lg bg-background text-sm space-y-2 animate-in slide-in-from-top-2">
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold">{searchedApp.reference_number}</p>
                                        <StatusBadge status={searchedApp.status} className="scale-90 origin-top-right" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Type: {searchedApp.candidate_type}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Quick Links</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <Link to="/admission/verification" className="flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors text-sm">
                                <span>Upload Documents</span>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                            <Link to="/admission/fees" className="flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors text-sm">
                                <span>Pay Admission Fees</span>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                            <Link to="/contact" className="flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors text-sm">
                                <span>Contact Support</span>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StatusPage;
