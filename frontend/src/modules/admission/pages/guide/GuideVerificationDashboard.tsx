import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { admissionApi } from '../../api';
import { CheckCircle2, XCircle, FileText } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';

export const GuideVerificationDashboard: React.FC = () => {
    const [verifications, setVerifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [remark, setRemark] = useState('');
    const [processing, setProcessing] = useState(false);
    const [actionType, setActionType] = useState<'VERIFY' | 'REJECT' | null>(null);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await admissionApi.getPendingGuideVerifications();
            if (res.success) setVerifications(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleAction = async () => {
        if (actionType === 'REJECT' && !remark) {
            alert("Remark is mandatory for rejection.");
            return;
        }

        setProcessing(true);
        try {
            // Note: Reuse existing verification API
            // Status Enum: 'VERIFIED' | 'REJECTED'
            const res = await admissionApi.verifyGuide({
                applicationId: selectedApp.application_id, // Ensure correct ID mapping
                status: actionType === 'VERIFY' ? 'VERIFIED' : 'REJECTED',
                remark
            });
            if (res.success) {
                alert(`Application ${actionType === 'VERIFY' ? 'Verified' : 'Rejected'} Successfully`);
                setSelectedApp(null);
                setActionType(null);
                setRemark('');
                fetchPending();
            }
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to process verification");
        } finally {
            setProcessing(false);
        }
    };

    const openVerify = (app: any) => {
        setSelectedApp(app);
        setActionType('VERIFY');
        setRemark('Welcome to the research group.');
    };

    const openReject = (app: any) => {
        setSelectedApp(app);
        setActionType('REJECT');
        setRemark('');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="Scholar Verification"
                description="Confirm your acceptance of allocated research scholars."
            />

            <div className="grid gap-4">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))
                ) : verifications.length === 0 ? (
                    <EmptyState
                        title="No Pending Verifications"
                        description="You have no new scholars waiting for confirmation."
                        icon={CheckCircle2}
                    />
                ) : (
                    verifications.map((item) => {
                        const app = item.application;
                        return (
                            <Card key={item.id} className="border-l-4 border-l-blue-500">
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">
                                            {app.payload?.personal_details?.full_name || 'Candidate Name'}
                                        </CardTitle>
                                        <CardDescription className="font-mono">
                                            {app.reference_number}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
                                            Accepted by Student
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-2 mb-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            <span>Research Area: {app.payload?.research_interest?.area_of_interest || 'N/A'}</span>
                                        </div>
                                        <div className="text-xs pt-2">
                                            Allocated on: {new Date(item.allocated_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2 border-t mt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openReject(item)}
                                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                        >
                                            <XCircle className="mr-2 h-4 w-4" /> Reject
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => openVerify(item)}
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm Admission
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{actionType === 'VERIFY' ? 'Confirm Admission' : 'Reject Allocation'}</DialogTitle>
                        <DialogDescription>
                            {actionType === 'VERIFY'
                                ? `Confirm admission for ${selectedApp?.application?.payload?.personal_details?.full_name}?`
                                : `Reject allocation for ${selectedApp?.application?.payload?.personal_details?.full_name}? This action is irreversible.`
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="remark">
                                {actionType === 'VERIFY' ? 'Welcome Message (Optional)' : 'Reason for Rejection (Required)'}
                            </Label>
                            <Input
                                id="remark"
                                placeholder={actionType === 'VERIFY' ? "Welcome to the team..." : "Reason..."}
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedApp(null)} disabled={processing}>Cancel</Button>
                        <Button
                            onClick={handleAction}
                            disabled={processing}
                            variant={actionType === 'REJECT' ? 'destructive' : 'default'}
                            className={actionType === 'VERIFY' ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                            {processing ? 'Processing...' : (actionType === 'VERIFY' ? 'Confirm' : 'Reject')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default GuideVerificationDashboard;
