import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { admissionApi } from '../../api';
import { CheckCircle2, Search, Clock, CreditCard, Download } from 'lucide-react';

export const FeeVerification = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [remark, setRemark] = useState('');
    const [processing, setProcessing] = useState(false);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await admissionApi.getPendingFeeVerifications();
            if (res.success) setApplications(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleVerify = async () => {
        setProcessing(true);
        try {
            const res = await admissionApi.verifyFeePayment({
                applicationId: selectedApp.id,
                remark: remark || 'Verified by DRC'
            });
            if (res.success) {
                alert("Fee Verified Successfully");
                setSelectedApp(null);
                setRemark('');
                fetchPending();
            }
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to verify fee");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Fee Verification</h2>
                    <p className="text-muted-foreground">Verify payment details for eligible candidates.</p>
                </div>
                <Button onClick={fetchPending} variant="outline" size="sm">
                    Refresh List
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Verifications</CardTitle>
                    <CardDescription>{applications.length} payments waiting for verification.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : applications.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No pending fee verifications found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {applications.map((app) => {
                                // Extract payment info from join if available, or just show app details
                                // The backend returns admission_fee_payments array or object
                                const payment = app.admission_fee_payments?.[0]; // Assuming array join or check structure logic
                                return (
                                    <div key={app.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm text-muted-foreground">{app.reference_number}</span>
                                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700">
                                                    Payment Pending Verification
                                                </span>
                                            </div>
                                            <p className="font-medium text-lg leading-none">
                                                {app.payload?.personal_details?.full_name || 'N/A'}
                                            </p>
                                            <div className="flex gap-4 text-sm text-muted-foreground">
                                                <span>{app.payload?.email}</span>
                                            </div>
                                            {payment && (
                                                <div className="text-xs text-muted-foreground pt-1 flex items-center gap-2">
                                                    <CreditCard className="h-3 w-3" />
                                                    Ref: <span className="font-mono font-medium text-foreground">{payment.transaction_reference}</span>
                                                    <span>•</span>
                                                    <span>{new Date(payment.payment_date).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {payment?.receipt_url && (
                                                <Button size="sm" variant="outline" onClick={() => window.open(payment.receipt_url, '_blank')} className="gap-2">
                                                    <Download className="h-4 w-4" /> Receipt
                                                </Button>
                                            )}
                                            <Button size="sm" onClick={() => setSelectedApp(app)} className="gap-2 bg-green-600 hover:bg-green-700">
                                                <CheckCircle2 className="h-4 w-4" /> Verify Payment
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
                        <DialogTitle>Confirm Fee Verification</DialogTitle>
                        <DialogDescription>
                            Verify payment for {selectedApp?.payload?.personal_details?.full_name}. This will enable Guide Allocation.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="remark">Remarks (Optional)</Label>
                            <Input
                                id="remark"
                                placeholder="Verification notes..."
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedApp(null)} disabled={processing}>Cancel</Button>
                        <Button onClick={handleVerify} disabled={processing} className="bg-green-600 hover:bg-green-700">
                            {processing ? 'Processing...' : 'Confirm Verification'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FeeVerification;
