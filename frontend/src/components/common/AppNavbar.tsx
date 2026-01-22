
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Bell, User, LogOut, Settings } from 'lucide-react';

interface AppNavbarProps {
    user?: {
        name: string;
        role: string;
        avatarUrl?: string;
    };
    onLogout?: () => void;
    onProfileClick?: () => void;
    brandName?: string;
    logo?: React.ReactNode;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
    user,
    onLogout,
    onProfileClick,
    brandName = "EduPlatform",
    logo
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex h-16 items-center px-4 gap-4 max-w-7xl mx-auto w-full">
                {/* Logo Section */}
                <div className="flex items-center gap-2 font-bold text-xl mr-auto text-foreground">
                    {logo || <div className="h-8 w-8 bg-primary rounded-lg shadow-sm flex items-center justify-center text-primary-foreground font-black">E</div>}
                    <span className="hidden md:inline-block tracking-tight">{brandName}</span>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 sm:gap-4">

                    {/* Role Badge */}
                    {user?.role && (
                        <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wide">
                            {user.role}
                        </span>
                    )}

                    {/* Notifications */}
                    <button className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground relative group">
                        <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full ring-2 ring-background" />
                    </button>

                    <div className="h-6 w-px bg-border hidden sm:block" />

                    {/* User Profile */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 hover:bg-muted p-1 pr-3 rounded-full transition-all border border-transparent hover:border-border outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <div className="h-8 w-8 rounded-full overflow-hidden bg-muted flex items-center justify-center border border-border">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-5 w-5 text-muted-foreground" />
                                )}
                            </div>
                            <div className="flex flex-col items-start text-sm">
                                <span className="font-medium hidden sm:block leading-none">{user?.name || 'Guest'}</span>
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsDropdownOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-popover text-popover-foreground shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                    <div className="p-2 space-y-1">
                                        <div className="px-2 py-2 text-sm">
                                            <p className="font-semibold">{user?.name || 'Guest User'}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user?.role || 'Visitor'}</p>
                                        </div>
                                        <div className="h-px bg-border my-1" />
                                        <button
                                            onClick={() => { onProfileClick?.(); setIsDropdownOpen(false); }}
                                            className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                                        >
                                            <User className="h-4 w-4" /> Profile
                                        </button>
                                        <button
                                            onClick={() => { setIsDropdownOpen(false); }}
                                            className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                                        >
                                            <Settings className="h-4 w-4" /> Settings
                                        </button>
                                        <div className="h-px bg-border my-1" />
                                        <button
                                            onClick={() => { onLogout?.(); setIsDropdownOpen(false); }}
                                            className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-destructive/10 text-destructive hover:text-destructive transition-colors font-medium"
                                        >
                                            <LogOut className="h-4 w-4" /> Logout
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
