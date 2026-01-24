import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { admissionApi } from '../../api';
import { CheckCircle2, XCircle, Search, Clock, FileText } from 'lucide-react';

export const GuideVerification = () => {
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
            const res = await admissionApi.verifyGuide({
                applicationId: selectedApp.application_id,
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
        setRemark('Verification Confirmed by Guide');
    };

    const openReject = (app: any) => {
        setSelectedApp(app);
        setActionType('REJECT');
        setRemark('');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Guide Verification</h2>
                    <p className="text-muted-foreground">Confirm acceptance of research scholars.</p>
                </div>
                <Button onClick={fetchPending} variant="outline" size="sm">
                    Refresh List
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Confirmations</CardTitle>
                    <CardDescription>{verifications.length} scholars waiting for your confirmation.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : verifications.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No pending verifications found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {verifications.map((item) => {
                                const app = item.application;
                                return (
                                    <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm text-muted-foreground">{app.reference_number}</span>
                                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700">
                                                    Applicant Accepted
                                                </span>
                                            </div>
                                            <p className="font-medium text-lg leading-none">
                                                {app.payload?.personal_details?.full_name || 'N/A'}
                                            </p>
                                            <div className="flex gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {app.payload?.research_interest?.area_of_interest || 'Research Area N/A'}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground pt-1">
                                                Allocated on: {new Date(item.allocated_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => openReject(item)} className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
                                                <XCircle className="h-4 w-4" /> Reject
                                            </Button>
                                            <Button size="sm" onClick={() => openVerify(item)} className="gap-2 bg-green-600 hover:bg-green-700">
                                                <CheckCircle2 className="h-4 w-4" /> Confirm
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{actionType === 'VERIFY' ? 'Confirm Admission' : 'Reject Allocation'}</DialogTitle>
                        <DialogDescription>
                            {actionType === 'VERIFY'
                                ? `Are you sure you want to accept ${selectedApp?.application?.payload?.personal_details?.full_name} as your research scholar?`
                                : `Please provide a reason for rejecting ${selectedApp?.application?.payload?.personal_details?.full_name}.`
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="remark">Remarks</Label>
                            <Input
                                id="remark"
                                placeholder={actionType === 'VERIFY' ? "Optional welcome note..." : "Reason for rejection (Mandatory)"}
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
                            {processing ? 'Processing...' : (actionType === 'VERIFY' ? 'Confirm Admission' : 'Reject Allocation')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default GuideVerification;
