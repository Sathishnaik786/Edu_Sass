
import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Minus, LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    trend?: {
        value: number; // percentage
        label?: string; // e.g. "vs last month"
        direction: 'up' | 'down' | 'neutral';
    };
    icon?: LucideIcon;
    className?: string;
    description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    trend,
    icon: Icon,
    className,
    description
}) => {
    return (
        <div className={cn("group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20", className)}>
            <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">{label}</p>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />}
            </div>

            <div className="flex items-baseline gap-2 mt-2">
                <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
                {description && <span className="text-xs text-muted-foreground ml-1">{description}</span>}
            </div>

            {trend && (
                <div className="mt-4 flex items-center gap-2 text-xs">
                    <span className={cn(
                        "flex items-center font-bold rounded-md px-2 py-0.5 transition-colors",
                        trend.direction === 'up' && "text-emerald-700 bg-emerald-100/50 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
                        trend.direction === 'down' && "text-red-700 bg-red-100/50 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800",
                        trend.direction === 'neutral' && "text-zinc-700 bg-zinc-100/50 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700",
                    )}>
                        {trend.direction === 'up' && <ArrowUpRight className="mr-1 h-3 w-3" />}
                        {trend.direction === 'down' && <ArrowDownRight className="mr-1 h-3 w-3" />}
                        {trend.direction === 'neutral' && <Minus className="mr-1 h-3 w-3" />}
                        {Math.abs(trend.value)}%
                    </span>
                    {trend.label && <span className="text-muted-foreground font-medium">{trend.label}</span>}
                </div>
            )}

            {/* Decorative background shape */}
            {Icon && (
                <Icon className="absolute -right-4 -bottom-4 h-24 w-24 opacity-[0.03] text-foreground -z-10 group-hover:scale-110 transition-transform duration-500 bg-blend-overlay -rotate-12" />
            )}
        </div>
    );
};
