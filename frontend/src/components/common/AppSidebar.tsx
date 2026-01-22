
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, LayoutDashboard, Settings, Users, FileText } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

export interface MenuItem {
    label: string;
    icon: React.ElementType;
    path: string;
    badge?: number | string;
}

interface AppSidebarProps {
    items?: MenuItem[];
    collapsed?: boolean;
    onToggleCollapse?: () => void;
    className?: string;
}

// Default items for demo purposes
const defaultItems: MenuItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Academics', icon: FileText, path: '/academics' },
    { label: 'Students', icon: Users, path: '/students' },
    { label: 'Settings', icon: Settings, path: '/settings' },
];

export const AppSidebar: React.FC<AppSidebarProps> = ({
    items = defaultItems,
    collapsed,
    onToggleCollapse,
    className
}) => {
    const [internalCollapsed, setInternalCollapsed] = useState(false);

    // Resolve controlled vs uncontrolled state
    const isCollapsed = collapsed !== undefined ? collapsed : internalCollapsed;
    const handleToggle = onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));

    const location = useLocation();

    return (
        <aside
            className={cn(
                "bg-card border-r border-border min-h-screen transition-all duration-300 ease-in-out relative flex flex-col z-40 group shadow-sm",
                isCollapsed ? "w-20" : "w-72",
                className
            )}
        >
            <button
                onClick={handleToggle}
                className="absolute -right-3 top-6 h-6 w-6 rounded-full border border-border bg-background flex items-center justify-center shadow-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors z-50 focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </button>

            {/* Header/Logo Area inside Sidebar (optional matching header height) */}
            <div className={cn("flex h-16 items-center border-b border-border/50", isCollapsed ? "justify-center" : "px-6")}>
                {/* Placeholder for when sidebar is its own isolated nav structure */}
                <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex shrink-0" />
                {!isCollapsed && (
                    <span className="ml-3 font-bold text-lg tracking-tight">EduSoft</span>
                )}
            </div>

            <div className="flex flex-col gap-1 p-3 py-6 flex-1 overflow-y-auto">
                {items.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center px-3 py-3 rounded-md text-sm font-medium transition-all duration-200 group/item relative overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                isCollapsed ? "justify-center px-2" : "gap-3"
                            )}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <Icon className={cn("h-5 w-5 shrink-0 transition-transform duration-200", isActive && !isCollapsed && "scale-105")} />

                            {!isCollapsed && (
                                <span className="truncate flex-1 rendering-pixelated">{item.label}</span>
                            )}

                            {!isCollapsed && item.badge && (
                                <span className="px-2 py-0.5 rounded-full bg-background/20 text-[10px] font-bold leading-none border border-white/10">
                                    {item.badge}
                                </span>
                            )}

                            {/* Tooltip-like popup for collapsed state could go here */}
                        </Link>
                    );
                })}
            </div>

            {!isCollapsed && (
                <div className="p-4 m-4 rounded-xl bg-accent/50 border border-border/50">
                    <div className="text-xs font-medium text-foreground mb-1">Need Help?</div>
                    <div className="text-[10px] text-muted-foreground mb-3">Check our docs</div>
                    <button className="text-xs w-full bg-background border border-input hover:bg-accent hover:text-accent-foreground h-7 rounded px-2 shadow-sm transition-colors">
                        Documentation
                    </button>
                </div>
            )}
        </aside>
    );
};
