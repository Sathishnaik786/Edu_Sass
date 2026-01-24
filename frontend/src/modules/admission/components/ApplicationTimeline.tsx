import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { admissionApi } from '../api';
import { APPLICATION_WORKFLOW, REJECTION_STATUSES } from '../constants/applicationWorkflow';
import { Skeleton } from '@/components/ui/skeleton';

interface ApplicationTimelineProps {
    applicationId: string;
    className?: string;
}

interface TimelineData {
    currentStatus: string;
    history: {
        status: string;
        remarks?: string;
        created_at: string;
        changed_by?: string;
    }[];
}

function resolveStepState(
    stepKey: string,
    timelineHistory: TimelineData['history'],
    currentStatus: string
) {
    // Check if this step exists in history (Completed)
    // We map generic steps to specific status codes if needed, or assume 1:1 mapping for key milestones
    // For now, assuming exact match or mapping logic.
    // However, the backend history stores EXACT status strings (e.g. SCRUTINY_APPROVED).
    // The workflow keys are: SUBMITTED, SCRUTINY, INTERVIEW, MERIT_LIST, ADMISSION_APPROVED.

    // Logic: 
    // SUBMITTED -> matches 'SUBMITTED'
    // SCRUTINY -> matches 'SCRUTINY_APPROVED' or 'SCRUTINY_REJECTED' or 'UNDER_SCRUTINY'
    // This mapping is tricky without a shared map. 
    // Let's infer "Completion" if a LATER step is present?
    // Or check for specific success markers.

    // Simplification for the Demo as requested: "UI is 100% backend-driven".
    // AND "Completed steps turn GREEN".

    // To make this robust, we check if ANY history item *Corresponds* to this step being passed.
    // e.g. "SCRUTINY" step is done if 'SCRUTINY_APPROVED' is in history.
    // "INTERVIEW" step is done if 'INTERVIEW_PASSED' or 'INTERVIEW_SCHEDULED'? No, 'INTERVIEW_PASSED'.

    // Let's refine the WORKFLOW keys to match actual DB statuses OR map them.
    // The user provided: SUBMITTED, SCRUTINY, INTERVIEW, MERIT_LIST, ADMISSION_APPROVED.
    // DB Statuses: SUBMITTED, SCRUTINY_APPROVED, INTERVIEW_PASSED, DOCUMENTS_VERIFIED, FEE_PAID, GUIDE_ALLOCATED.

    // I entered the Workflow keys exactly as the user asked.
    // I must map them or check history broadly.

    const isSubmitted = timelineHistory.some(h => h.status === 'SUBMITTED');

    if (stepKey === 'SUBMITTED') {
        return { state: isSubmitted ? 'completed' : 'pending', date: timelineHistory.find(h => h.status === 'SUBMITTED')?.created_at };
    }

    if (stepKey === 'SCRUTINY') {
        const approved = timelineHistory.find(h => h.status === 'SCRUTINY_APPROVED');
        if (approved) return { state: 'completed', date: approved.created_at };
        const rejected = timelineHistory.find(h => h.status === 'SCRUTINY_REJECTED');
        if (rejected) return { state: 'rejected', date: rejected.created_at, remarks: rejected.remarks };
        if (currentStatus === 'SUBMITTED' || currentStatus === 'UNDER_SCRUTINY') return { state: 'active' };
    }

    if (stepKey === 'INTERVIEW') {
        const passed = timelineHistory.find(h => h.status === 'INTERVIEW_PASSED');
        if (passed) return { state: 'completed', date: passed.created_at };
        const failed = timelineHistory.find(h => h.status === 'INTERVIEW_FAILED');
        if (failed) return { state: 'rejected', date: failed.created_at, remarks: failed.remarks };
        const scheduled = timelineHistory.find(h => h.status === 'INTERVIEW_SCHEDULED');
        if (scheduled) return { state: 'active', date: scheduled.created_at, remarks: 'Interview Scheduled' }; // Blue
        // Also active if Scrutiny Approved but not yet scheduled?
        if (currentStatus === 'SCRUTINY_APPROVED') return { state: 'pending' }; // Waiting for schedule? Or active? User said blue = current. 
    }

    if (stepKey === 'MERIT_LIST') {
        // Mapping roughly to Docs Verified / Fee phases as "Merit/Selection"
        const verified = timelineHistory.find(h => h.status === 'DOCUMENTS_VERIFIED');
        if (verified) return { state: 'completed', date: verified.created_at };
        if (currentStatus === 'INTERVIEW_PASSED') return { state: 'active' };
    }

    if (stepKey === 'ADMISSION_APPROVED') {
        const admitted = timelineHistory.find(h => h.status === 'ADMISSION_CONFIRMED');
        if (admitted) return { state: 'completed', date: admitted.created_at };

        const guideRejected = timelineHistory.find(h => h.status === 'GUIDE_REJECTED');
        if (guideRejected) return { state: 'rejected', date: guideRejected.created_at, remarks: guideRejected.remarks };

        const guideAccepted = timelineHistory.find(h => h.status === 'GUIDE_ACCEPTED_BY_APPLICANT');
        if (guideAccepted) return { state: 'active', date: guideAccepted.created_at, remarks: 'Awaiting Faculty Confirmation.' };

        const guideAllocated = timelineHistory.find(h => h.status === 'GUIDE_ALLOCATED');
        if (guideAllocated) return { state: 'active', date: guideAllocated.created_at, remarks: 'Guide Allocated. Action Required.' };

        // Fee Logic
        const feeRejected = timelineHistory.find(h => h.status === 'FEE_REJECTED');
        if (feeRejected) return { state: 'rejected', date: feeRejected.created_at, remarks: feeRejected.remarks };

        const feeVerified = timelineHistory.find(h => h.status === 'FEE_VERIFIED');
        if (feeVerified) return { state: 'active', date: feeVerified.created_at, remarks: 'Fee Verified. Awaiting Guide Allocation.' };

        const feePending = timelineHistory.find(h => h.status === 'FEE_VERIFICATION_PENDING');
        if (feePending) return { state: 'active', date: feePending.created_at, remarks: 'Payment Received. Verification Pending.' };

        if (currentStatus === 'FEE_PAID') return { state: 'active', remarks: 'Payment Received. Verifying...' };
        if (currentStatus === 'DOCUMENTS_VERIFIED') return { state: 'active', remarks: 'Eligible for Admission Fee Payment' };
    }

    // Default Fallback: Simple matching if exact key exists
    const record = timelineHistory.find(h => h.status === stepKey);
    if (record) return { state: 'completed', date: record.created_at };

    return { state: 'pending' };
}


export const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({ applicationId, className }) => {
    const [timeline, setTimeline] = useState<TimelineData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!applicationId) return;
        const fetchTimeline = async () => {
            try {
                const res = await admissionApi.getTimeline(applicationId);
                if (res.success) {
                    setTimeline(res.data);
                }
            } catch (error) {
                console.error("Failed to load timeline", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTimeline();
    }, [applicationId]);

    if (loading) {
        return <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>;
    }

    if (!timeline) return null;

    // Detect Global Rejection
    const globalRejection = timeline.history.find(h => REJECTION_STATUSES.includes(h.status));
    const isRejected = Boolean(globalRejection);

    return (
        <div className={cn("space-y-0", className)}>
            {APPLICATION_WORKFLOW.map((step, index) => {
                const stepState = resolveStepState(step.key, timeline.history, timeline.currentStatus);

                // Override if global rejection and this is the step that failed (approximate)
                // Actually resolveStepState handles specific rejections better.
                // But specifically for coloring:

                // Colors:
                // Completed: Green
                // Active: Blue
                // Rejected: Red
                // Pending: Gray

                const isCompleted = stepState.state === 'completed';
                const isActive = stepState.state === 'active';
                const isStepRejected = stepState.state === 'rejected'; // Specific rejection

                // Color Logic
                let iconColor = "text-muted-foreground";
                let lineColor = "bg-border";
                let icon = <Circle className="h-5 w-5" />;

                if (isCompleted) {
                    iconColor = "text-green-600";
                    lineColor = "bg-green-600";
                    icon = <CheckCircle2 className="h-5 w-5" />;
                } else if (isStepRejected) {
                    iconColor = "text-red-600";
                    icon = <XCircle className="h-5 w-5" />;
                } else if (isActive) {
                    iconColor = "text-blue-600";
                    icon = <Clock className="h-5 w-5 animate-pulse" />;
                }

                return (
                    <div key={step.key} className="flex gap-4 relative pb-8 last:pb-0">
                        {/* Connecting Line */}
                        {index < APPLICATION_WORKFLOW.length - 1 && (
                            <div className={cn(
                                "absolute left-2.5 top-6 bottom-0 w-0.5 transition-colors duration-500",
                                isCompleted ? "bg-green-600" : "bg-border"
                            )} />
                        )}

                        <div className={cn("relative z-10 bg-background rounded-full p-0.5", iconColor)}>
                            {icon}
                        </div>

                        <div className="flex-1 pt-0.5">
                            <h4 className={cn("font-medium text-sm", isCompleted ? "text-foreground" : "text-muted-foreground")}>
                                {step.label}
                            </h4>
                            {stepState.date && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {new Date(stepState.date).toLocaleDateString()}
                                </p>
                            )}
                            {stepState.remarks && (
                                <div className="mt-2 text-xs bg-red-50 text-red-700 p-2 rounded border border-red-100 flex gap-2 items-start">
                                    <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                                    <span>{stepState.remarks}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
