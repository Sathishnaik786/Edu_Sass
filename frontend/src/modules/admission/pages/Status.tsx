import React, { useEffect, useState } from 'react';
import { admissionApi } from '../api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { ApplicationTimeline } from '../components/ApplicationTimeline';
import { FileText, Search, Bell, Clock, ArrowRight, Download, CheckCircle2, UserPlus, XCircle } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '../components/StatusBadge';
import { FeePaymentAction } from '../components/FeePaymentAction';

const StatusPage: React.FC = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState<any[]>([]);
    const [refNumber, setRefNumber] = useState('');
    const [searchedApp, setSearchedApp] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [certificate, setCertificate] = useState<any>(null);
    const [guideAllocation, setGuideAllocation] = useState<any>(null);
    const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
    const [acceptRemark, setAcceptRemark] = useState('');
    const [accepting, setAccepting] = useState(false);

    useEffect(() => {
        const fetchInternalApps = async () => {
            try {
                const res = await admissionApi.getMyApplications();
                if (res.success) {
                    setApplications(res.data);

                    // If latest app is GUIDE_ALLOCATED or ACCEPTED, fetch related data
                    const latest = res.data[0];
                    if (latest && (latest.status === 'GUIDE_ALLOCATED' || latest.status === 'GUIDE_ACCEPTED_BY_APPLICANT')) {
                        Promise.all([
                            admissionApi.getCertificate(latest.id).catch(() => null),
                            admissionApi.getGuideAllocation(latest.id).catch(() => null)
                        ]).then(([certRes, allocRes]) => {
                            if (certRes && certRes.success) setCertificate(certRes.data);
                            if (allocRes && allocRes.success) setGuideAllocation(allocRes.data);
                        });
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

    const handleAcceptGuide = async () => {
        const latest = applications[0];
        if (!latest) return;

        setAccepting(true);
        try {
            const res = await admissionApi.acceptGuide({
                applicationId: latest.id,
                remark: acceptRemark
            });
            if (res.success) {
                alert('Guide Allocation Accepted Successfully!');
                setAcceptDialogOpen(false);
                window.location.reload();
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to accept guide.');
        } finally {
            setAccepting(false);
        }
    };

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
                        {/* New Fee Payment Logic */}
                        {recentApp?.status === 'DOCUMENTS_VERIFIED' && (
                            <FeePaymentAction
                                applicationId={recentApp.id}
                                onSuccess={() => {
                                    window.location.reload();
                                }}
                            />
                        )}

                        {recentApp?.status === 'FEE_VERIFICATION_PENDING' && (
                            <Button disabled variant="outline" className="gap-2 border-amber-200 bg-amber-50 text-amber-700 opacity-100">
                                <Clock className="h-4 w-4 animate-pulse" /> Payment Verification Pending
                            </Button>
                        )}

                        {recentApp?.status === 'GUIDE_ALLOCATED' && (
                            <Button
                                variant="outline"
                                className="gap-2 border-primary text-primary hover:bg-primary/5 shadow-sm"
                                onClick={() => {
                                    const url = certificate?.certificate_url || certificate?.file_url;
                                    if (url) {
                                        window.open(url, '_blank');
                                    } else {
                                        alert('Certificate generation in progress. Please refresh in a moment.');
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
                    {guideAllocation && (
                        <Card className="border-green-200 bg-green-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-800">
                                    <UserPlus className="h-5 w-5" /> Guide Allocated
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="font-semibold text-gray-500">Guide Name</p>
                                        <p className="font-medium text-lg">{guideAllocation.guide?.full_name || 'Faculty Member'}</p>
                                        <p className="text-xs text-muted-foreground">{guideAllocation.guide?.email}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-500">Allocated Date</p>
                                        <p>{new Date(guideAllocation.allocated_at).toLocaleDateString()}</p>
                                    </div>
                                    {guideAllocation.allocation_remarks && (
                                        <div className="col-span-full bg-white/50 p-2 rounded border border-green-100">
                                            <p className="font-semibold text-gray-500 text-xs">Remarks from Committee</p>
                                            <p className="text-green-900">{guideAllocation.allocation_remarks}</p>
                                        </div>
                                    )}
                                    {certificate && (
                                        <div className="col-span-full mt-2 pt-2 border-t border-green-200">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-xs font-semibold text-green-800">Allocation Certificate</p>
                                                    <p className="font-mono text-sm">{certificate.certificate_number || 'Processing...'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-muted-foreground">Issued</p>
                                                    <p className="text-xs font-medium">{certificate.generated_at ? new Date(certificate.generated_at).toLocaleDateString() : 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {recentApp?.status === 'GUIDE_ALLOCATED' && (
                                        <div className="col-span-full mt-4 pt-4 border-t flex justify-end">
                                            <Button
                                                onClick={() => setAcceptDialogOpen(true)}
                                                className="bg-green-600 hover:bg-green-700 shadow-sm"
                                            >
                                                <CheckCircle2 className="mr-2 h-4 w-4" /> Accept Guide Allocation
                                            </Button>
                                        </div>
                                    )}

                                    {recentApp?.status === 'GUIDE_ACCEPTED_BY_APPLICANT' && (
                                        <div className="col-span-full mt-4 pt-4 border-t flex justify-end">
                                            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 border border-amber-200 shadow-sm animate-pulse">
                                                <Clock className="mr-1 h-4 w-4" /> Waiting for Guide Confirmation
                                            </span>
                                        </div>
                                    )}

                                    {recentApp?.status === 'ADMISSION_CONFIRMED' && (
                                        <div className="col-span-full mt-4 pt-4 border-t space-y-2">
                                            <div className="bg-green-100 border border-green-200 rounded-lg p-4 text-center">
                                                <h3 className="text-lg font-bold text-green-800 flex items-center justify-center gap-2">
                                                    <CheckCircle2 className="h-6 w-6" /> Absorption Confirmed!
                                                </h3>
                                                <p className="text-green-700 mt-1">
                                                    Congratulations! Your admission is confirmed. Thank you for taking admission. Next steps will be sent to your registered email or check your dashboard shortly.
                                                </p>
                                                <p className="text-xs text-green-600 mt-2 font-mono">
                                                    Confirmed on: {new Date(recentApp.updated_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {recentApp?.status === 'GUIDE_REJECTED' && (
                                        <div className="col-span-full mt-4 pt-4 border-t">
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                <h3 className="text-red-800 font-semibold flex items-center gap-2">
                                                    <XCircle className="h-5 w-5" /> Guide Allocation Rejected
                                                </h3>
                                                <div className="mt-2 text-sm text-red-700">
                                                    The faculty has rejected this allocation. Please contact the DRC for reallocation.
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

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
                                    applicationId={recentApp.id}
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

            <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Accept Guide Allocation</DialogTitle>
                        <DialogDescription>
                            Confirm your acceptance of the allocated research guide. This action is final.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="remark">Remarks (Optional)</Label>
                            <Input
                                id="remark"
                                placeholder="Any notes..."
                                value={acceptRemark}
                                onChange={(e) => setAcceptRemark(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAcceptDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAcceptGuide} disabled={accepting} className="bg-green-600 hover:bg-green-700">
                            {accepting ? 'Processing...' : 'Confirm Acceptance'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default StatusPage;
