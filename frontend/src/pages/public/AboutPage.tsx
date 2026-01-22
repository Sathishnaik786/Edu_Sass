
import React from 'react';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Building2, Globe, GraduationCap, Target } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <PublicNavbar />
            <main className="flex-1 py-12">
                <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <PageHeader
                        title="About EduPlatform"
                        description="Fostering academic excellence through innovation and rigorous governance."
                    />

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">A Legacy of Research Excellence</h2>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Established with the vision to drive cutting-edge research and innovation, EduPlatform serves as a beacon for aspiring scholars.
                                Our institution prides itself on a robust academic ecosystem that blends traditional values with modern methodology.
                            </p>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                We are committed to maintaining the highest standards of academic integrity, transparency in admissions, and rigorous evaluation processes
                                handled by our distinguished Departmental Research Committees (DRC).
                            </p>
                        </div>
                        <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden bg-muted/50 border flex items-center justify-center">
                            <Building2 className="h-24 w-24 text-muted-foreground/20" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent mix-blend-multiply" />
                        </div>
                    </div>

                    <div className="mt-24">
                        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Core Principles</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: GraduationCap,
                                    title: "Academic Governance",
                                    desc: "Strict adherence to UGC guidelines and institutional policies ensures fairness and quality in every research undertaking."
                                },
                                {
                                    icon: Target,
                                    title: "Mission",
                                    desc: "To empower researchers with World-class infrastructure, expert guidance, and a transparent administrative framework."
                                },
                                {
                                    icon: Globe,
                                    title: "Global Vision",
                                    desc: "Creating a knowledge hub that transcends borders, fostering collaborations and interdisciplinary research."
                                }
                            ].map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <div key={idx} className="flex flex-col items-center text-center p-6 rounded-xl bg-card border shadow-sm hover:shadow-md transition-all">
                                        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                                            <Icon className="h-7 w-7" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </main>
            <PublicFooter />
        </div>
    );
}
