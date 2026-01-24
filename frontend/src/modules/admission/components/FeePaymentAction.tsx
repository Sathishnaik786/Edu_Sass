import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock, CheckCircle2 } from 'lucide-react';
import { admissionApi } from '../api';

interface FeePaymentActionProps {
    applicationId: string;
    onSuccess: () => void;
}

export const FeePaymentAction: React.FC<FeePaymentActionProps> = ({ applicationId, onSuccess }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'INIT' | 'CONFIRM'>('INIT');
    const [amount, setAmount] = useState<number>(0);
    const [reference, setReference] = useState('');

    const handleInitiate = async () => {
        setLoading(true);
        try {
            const res = await admissionApi.initiateFeePayment(applicationId);
            if (res.success) {
                setAmount(res.data.amount);
                setStep('CONFIRM');
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to initiate payment');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!reference) {
            alert('Transaction Reference Required');
            return;
        }

        setLoading(true);
        try {
            const res = await admissionApi.confirmFeePayment(applicationId, reference);
            if (res.success) {
                alert('Payment Successful! Your admission fee has been recorded.');
                setOpen(false);
                onSuccess();
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to confirm payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={() => { setOpen(true); handleInitiate(); }}
                className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-sm animate-in fade-in"
            >
                <CreditCard className="h-4 w-4" /> Pay Admission Fee
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Pay Admission Fee</DialogTitle>
                        <DialogDescription>
                            Secure payment for PhD Admission confirming your seat.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="p-4 bg-muted/50 rounded-lg flex justify-between items-center border">
                            <span className="text-sm font-medium">Total Amount</span>
                            <span className="text-xl font-bold font-mono">
                                {loading && step === 'INIT' ? '...' : `₹${amount}`}
                            </span>
                        </div>

                        {step === 'CONFIRM' && (
                            <div className="space-y-2">
                                <Label>Transaction Reference / UTR Number</Label>
                                <Input
                                    placeholder="Enter bank transaction ref..."
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Please enter the reference number from your bank transfer.
                                </p>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-blue-50 p-2 rounded text-blue-700">
                            <Lock className="h-3 w-3" />
                            <span>This payment is secured and directly linked to your application.</span>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
                        <Button onClick={handleConfirm} disabled={loading || step === 'INIT'}>
                            {loading ? 'Processing...' : 'Confirm Payment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
