
import React from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Calendar, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/common/PageHeader';

export default function AdmissionsPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <PublicNavbar />
            <main className="flex-1 py-12">
                <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <PageHeader
                        title="PhD Admissions 2026"
                        description="Comprehensive guide to the PhD Entrance Test (PET) and admission process."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-8">
                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <FileText className="h-6 w-6 text-primary" />
                                    About PET
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    The PhD Entrance Test (PET) is the qualifying examination for admission to PhD programs.
                                    It is designed to assess the research aptitude, subject knowledge, and analytical skills of the candidates.
                                    Qualifying PET is mandatory for all candidates unless they are exempted based on specific criteria (e.g., UGC-NET/JRF).
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <CheckCircle2 className="h-6 w-6 text-primary" />
                                    Eligibility Criteria
                                </h2>
                                <ul className="space-y-3">
                                    {[
                                        "Master's degree with at least 55% marks (or equivalent grade).",
                                        "Relaxation of 5% for SC/ST/OBC (non-creamy layer) and differently-abled candidates.",
                                        "Candidates waiting for final semester results can apply provisionally.",
                                        "Valid ID proof and academic documents are required."
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex gap-3 text-muted-foreground">
                                            <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section className="p-6 bg-primary/5 rounded-xl border border-primary/10">
                                <h3 className="font-semibold text-lg mb-2">Ready to start your research journey?</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Ensure you have scanned copies of your photo, signature, and marksheets before applying.
                                </p>
                                <Link
                                    to="/apply"
                                    className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                                >
                                    Apply for PET 2026 <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </section>
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                                <div className="p-6">
                                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                                        <Calendar className="h-5 w-5 text-primary" />
                                        Important Dates
                                    </h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: "Applications Start", date: "Jan 15, 2026" },
                                            { label: "Last Date to Apply", date: "Feb 28, 2026" },
                                            { label: "PET Exam Date", date: "Mar 15, 2026" },
                                            { label: "Results Declared", date: "Apr 01, 2026" },
                                        ].map((item, i) => (
                                            <div key={i} className="flex flex-col border-b last:border-0 pb-3 last:pb-0 border-border/50">
                                                <span className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</span>
                                                <span className="font-medium text-foreground">{item.date}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border bg-muted/40 text-card-foreground shadow-sm p-6">
                                <h4 className="font-semibold mb-2">Need Help?</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Contact the admission cell for any queries regarding the application process.
                                </p>
                                <Link to="/contact" className="text-sm font-medium text-primary hover:underline">
                                    Contact Support &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <PublicFooter />
        </div>
    );
}
