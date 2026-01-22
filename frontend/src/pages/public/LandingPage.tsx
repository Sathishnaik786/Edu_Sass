
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, ShieldCheck, CheckCircle2, Award, Calendar, Lightbulb } from 'lucide-react';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicFooter } from '@/components/public/PublicFooter';

const TimelineStep = ({ number, title, description }: { number: number, title: string, description: string }) => (
    <div className="relative flex flex-col items-center text-center p-4">
        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-4 z-10 ring-4 ring-background">
            {number}
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
        {/* Connector Line - simplified for pure CSS/Tailwind */}
        {number < 7 && (
            <div className="hidden md:block absolute top-9 left-1/2 w-full h-0.5 bg-border -z-0" />
        )}
    </div>
);

const RoleCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="bg-card hover:shadow-lg transition-all duration-300 p-6 rounded-xl border border-border group">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
            <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </div>
);

const StatItem = ({ value, label }: { value: string, label: string }) => (
    <div className="text-center">
        <div className="text-4xl font-extrabold text-primary mb-1">{value}</div>
        <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">{label}</div>
    </div>
);

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <PublicNavbar />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative py-20 lg:py-32 overflow-hidden">
                    <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
                    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            Admissions Open for 2026
                        </span>
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                            Advance Your Career with <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                                World-Class PhD Programs
                            </span>
                        </h1>
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                            Join a community of scholars and innovators using our seamless digital admission platform. Track your journey from application to graduation.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-7 duration-700 delay-200">
                            <Link
                                to="/apply"
                                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                            <Link
                                to="/admissions"
                                className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Process Timeline */}
                <section className="py-20 bg-muted/30">
                    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight mb-4">Your Journey to PhD</h2>
                            <p className="text-muted-foreground text-lg">A transparent 7-step process from application to verification.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                            <TimelineStep number={1} title="Apply" description="Submit online application via PET portal" />
                            <TimelineStep number={2} title="Entrance" description="Take the PhD Entrance Test" />
                            <TimelineStep number={3} title="Results" description="Check qualifying status online" />
                            <TimelineStep number={4} title="Interview" description="Present your research proposal" />
                            <TimelineStep number={5} title="Selection" description="Merit list declaration" />
                            <TimelineStep number={6} title="Guide" description="Allocation of research supervisor" />
                            <TimelineStep number={7} title="Admit" description="Document verification & fee payment" />
                        </div>
                    </div>
                </section>

                {/* Role Cards */}
                <section className="py-20">
                    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight mb-4">Empowering Every Stakeholder</h2>
                            <p className="text-muted-foreground text-lg">Our platform unifies the entire academic ecosystem.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <RoleCard
                                icon={BookOpen}
                                title="Students"
                                description="Seamless application process, real-time status tracking, and digital document management."
                            />
                            <RoleCard
                                icon={Users}
                                title="DRC Members"
                                description="Efficiently review research proposals, conduct interviews, and manage scholar progress."
                            />
                            <RoleCard
                                icon={ShieldCheck}
                                title="Administrators"
                                description="Complete oversight of the admission lifecycle with powerful analytics and reporting tools."
                            />
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-20 bg-primary text-primary-foreground">
                    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <StatItem value="500+" label="Research Scholars" />
                            <StatItem value="120+" label="Qualified Guides" />
                            <StatItem value="50+" label="Departments" />
                            <StatItem value="15k+" label="Applications" />
                        </div>
                    </div>
                </section>

            </main>
            <PublicFooter />
        </div>
    );
}
