
import React from 'react';
import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineStep {
    label: string;
    status: 'completed' | 'current' | 'pending' | 'rejected';
    date?: string;
    description?: string;
}

interface ApplicationTimelineProps {
    status: string;
    createdAt: string;
    className?: string;
}

const getSteps = (currentStatus: string, createdAt: string): TimelineStep[] => {
    // Simplified logic for demo purposes based on typical flow
    const steps: TimelineStep[] = [
        { label: 'Application Submitted', status: 'completed', date: new Date(createdAt).toLocaleDateString() },
        { label: 'Document Scrutiny', status: 'pending' },
        { label: 'Entrance Test / Interview', status: 'pending' },
        { label: 'Merit List', status: 'pending' },
        { label: 'Admission', status: 'pending' }
    ];

    const s = currentStatus?.toUpperCase() || '';

    if (s === 'SUBMITTED') {
        steps[1].status = 'current';
    }
    else if (s === 'SCRUTINY_PENDING') {
        steps[1].status = 'current';
        steps[1].description = 'Your documents are being reviewed.';
    }
    else if (s === 'SCRUTINY_REJECTED') {
        steps[1].status = 'rejected';
        steps[1].description = 'Documents rejected.';
    }
    else if (s === 'SCRUTINY_APPROVED') {
        steps[1].status = 'completed';
        steps[2].status = 'current';
        steps[2].description = 'Eligible for next stage.';
    }
    else if (s === 'INTERVIEW_SCHEDULED') {
        steps[1].status = 'completed';
        steps[2].status = 'current';
        steps[2].description = 'Interview scheduled.';
    }
    else if (s === 'INTERVIEW_COMPLETED') {
        steps[1].status = 'completed';
        steps[2].status = 'completed';
        steps[3].status = 'current';
        steps[3].description = 'Waiting for results.';
    }
    else if (s === 'MERIT_LISTED') {
        steps[1].status = 'completed';
        steps[2].status = 'completed';
        steps[3].status = 'completed';
        steps[4].status = 'current';
        steps[4].description = 'Proceed to admission.';
    }
    else if (s === 'ADMITTED') {
        steps.forEach(step => step.status = 'completed');
        steps[4].description = 'Welcome to the university!';
    }
    else if (s.includes('REJECTED')) {
        // Find the rejected step - simplified
        const activeIndex = steps.findIndex(step => step.status === 'current');
        if (activeIndex !== -1) steps[activeIndex].status = 'rejected';
    }

    return steps;
};

export const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({ status, createdAt, className }) => {
    const steps = getSteps(status, createdAt);

    return (
        <div className={cn("space-y-6", className)}>
            {steps.map((step, index) => (
                <div key={index} className="flex gap-4 relative">
                    {/* Vertical Line */}
                    {index < steps.length - 1 && (
                        <div className={cn(
                            "absolute left-3 top-8 bottom-[-24px] w-0.5",
                            step.status === 'completed' ? "bg-primary" : "bg-border"
                        )} />
                    )}

                    <div className="shrink-0 mt-0.5">
                        {step.status === 'completed' && <CheckCircle2 className="h-6 w-6 text-primary" />}
                        {step.status === 'current' && <div className="h-6 w-6 rounded-full border-2 border-primary bg-background flex items-center justify-center"><div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" /></div>}
                        {step.status === 'pending' && <Circle className="h-6 w-6 text-muted-foreground" />}
                        {step.status === 'rejected' && <XCircle className="h-6 w-6 text-destructive" />}
                    </div>

                    <div className="flex flex-col pb-1">
                        <span className={cn(
                            "font-medium leading-none mb-1",
                            step.status === 'completed' || step.status === 'current' ? "text-foreground" : "text-muted-foreground"
                        )}>
                            {step.label}
                        </span>
                        {step.description && (
                            <span className="text-sm text-muted-foreground">{step.description}</span>
                        )}
                        {step.date && (
                            <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {step.date}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
