import { cn } from "@/lib/utils";

export type ApplicationStatus =
    | 'SUBMITTED'
    | 'SCRUTINY_PENDING'
    | 'SCRUTINY_APPROVED'
    | 'SCRUTINY_REJECTED'
    | 'INTERVIEW_SCHEDULED'
    | 'INTERVIEW_PASSED'
    | 'INTERVIEW_FAILED'
    | 'DOCUMENTS_VERIFIED'
    | 'VERIFICATION_PENDING'
    | 'FEE_PAID'
    | 'GUIDE_ALLOCATED'
    | 'ADMITTED';

export const getStatusConfig = (status: string) => {
    const s = status?.toUpperCase();

    if (s.includes('REJECTED') || s.includes('FAILED')) {
        return {
            label: 'Rejected',
            className: 'bg-red-100 text-red-700 border-red-200',
        };
    }

    if (s === 'ADMITTED' || s === 'GUIDE_ALLOCATED' || s === 'FEE_PAID' || s === 'DOCUMENTS_VERIFIED') {
        return {
            label: s.replace(/_/g, ' '),
            className: 'bg-green-100 text-green-700 border-green-200',
        };
    }

    if (s === 'SCRUTINY_APPROVED' || s === 'INTERVIEW_PASSED') {
        return {
            label: s.replace(/_/g, ' '),
            className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        };
    }

    if (s === 'INTERVIEW_SCHEDULED' || s === 'SCRUTINY_PENDING' || s === 'VERIFICATION_PENDING') {
        return {
            label: s.replace(/_/g, ' '),
            className: 'bg-amber-100 text-amber-700 border-amber-200',
        };
    }

    if (s === 'SUBMITTED') {
        return {
            label: 'Submitted',
            className: 'bg-blue-100 text-blue-700 border-blue-200',
        };
    }

    return {
        label: s ? s.replace(/_/g, ' ') : 'Unknown',
        className: 'bg-gray-100 text-gray-700 border-gray-200',
    };
};

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
    const config = getStatusConfig(status);

    return (
        <span className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors",
            config.className,
            className
        )}>
            {config.label}
        </span>
    );
};
