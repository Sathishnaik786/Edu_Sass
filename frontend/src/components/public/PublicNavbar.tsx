
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { GraduationCap } from 'lucide-react';

export const PublicNavbar: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { label: 'Home', path: '/' },
        { label: 'Admissions', path: '/admissions' },
        { label: 'About', path: '/about' },
        { label: 'Contact', path: '/contact' },
    ];

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full">
            <div className="container flex h-16 items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 font-bold text-xl mr-8">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    <span>EduPlatform</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6 mr-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary",
                                location.pathname === item.path
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <Link
                        to="/login"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden sm:block"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/apply"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                        Apply Now
                    </Link>
                </div>
            </div>
        </nav>
    );
};
