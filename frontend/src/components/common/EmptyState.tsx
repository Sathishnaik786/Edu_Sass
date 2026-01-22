
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, FileQuestion } from 'lucide-react';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon = FileQuestion,
    title,
    description,
    action,
    className
}) => {
    return (
        <div className={cn(
            "flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-12 px-4 text-center animate-in fade-in zoom-in-95 duration-500 hover:bg-card/80 transition-colors",
            className
        )}>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/5 mb-6 ring-1 ring-primary/10 shadow-sm">
                <Icon className="h-10 w-10 text-primary/60" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">{title}</h3>
            <p className="max-w-md text-muted-foreground mb-8 text-base leading-relaxed">
                {description}
            </p>
            {action && (
                <div className="mt-2 transform transition-all hover:scale-105">
                    {action}
                </div>
            )}
        </div>
    );
};
