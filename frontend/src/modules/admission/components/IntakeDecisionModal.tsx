import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface IntakeDecisionModalProps {
    open: boolean;
    type: 'APPROVE' | 'REJECT';
    applicationId: string | null;
    onConfirm: (id: string, reason?: string) => Promise<void>;
    onClose: () => void;
}

export const IntakeDecisionModal: React.FC<IntakeDecisionModalProps> = ({
    open,
    type,
    applicationId,
    onConfirm,
    onClose
}) => {
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleConfirm = async () => {
        if (!applicationId) return;
        if (type === 'REJECT' && !reason.trim()) {
            setError('Rejection reason is required');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            await onConfirm(applicationId, reason);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Action failed');
        } finally {
            setSubmitting(false);
        }
    };

    const isApprove = type === 'APPROVE';

    return (
        <Dialog open={open} onOpenChange={(val) => !submitting && !val && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isApprove ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                            <XCircle className="h-5 w-5 text-destructive" />
                        )}
                        {isApprove ? 'Approve External Applicant' : 'Reject Applicant'}
                    </DialogTitle>
                    <DialogDescription>
                        {isApprove
                            ? 'This will create a system user account for the applicant and allow them to log in. They will be notified via email (conceptually).'
                            : 'This will reject the application permanently. This action cannot be undone.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {type === 'REJECT' && (
                        <div className="space-y-2">
                            <Label htmlFor="reason" className="text-right">
                                Reason for Rejection <span className="text-destructive">*</span>
                            </Label>
                            <textarea
                                id="reason"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Enter reason..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                    )}

                    {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        variant={isApprove ? "default" : "destructive"}
                        onClick={handleConfirm}
                        disabled={submitting}
                    >
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isApprove ? 'Confirm Approval' : 'Confirm Rejection'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
