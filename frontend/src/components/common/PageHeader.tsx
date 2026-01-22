
import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    className?: string;
    children?: React.ReactNode; // For things like breadcrumbs above title
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    description,
    actions,
    className,
    children
}) => {
    return (
        <div className={cn("flex flex-col gap-1 pb-6 md:pb-8", className)}>
            {children && <div className="mb-2">{children}</div>}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
                    {description && (
                        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>

                {actions && (
                    <div className="flex items-center gap-2 shrink-0 mt-2 md:mt-0">
                        {actions}
                    </div>
                )}
            </div>
            {/* Optional Separator */}
            <div className="h-px w-full bg-gradient-to-r from-border to-transparent mt-6" />
        </div>
    );
};
