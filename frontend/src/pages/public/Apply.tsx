
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicFooter } from '@/components/public/PublicFooter';
import { PageHeader } from '@/components/common/PageHeader';

const CandidateSelection: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <PublicNavbar />
            <main className="flex-1 py-12">
                <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <PageHeader
                        title="Apply for PhD"
                        description="Select your candidate type to begin your application process."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                        {/* Internal Candidate */}
                        <Card className="flex flex-col h-full hover:border-primary/50 transition-colors">
                            <CardHeader className="text-center pb-2">
                                <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                                    <UserCheck className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle className="text-2xl">Internal Candidate</CardTitle>
                                <CardDescription className="text-base mt-2">
                                    For existing students, staff, or faculty of the institution
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto pt-6">
                                <Button
                                    className="w-full text-base py-6"
                                    onClick={() => navigate('/apply/internal')}
                                >
                                    Continue as Internal Candidate
                                </Button>
                            </CardContent>
                        </Card>

                        {/* External Candidate */}
                        <Card className="flex flex-col h-full hover:border-primary/50 transition-colors">
                            <CardHeader className="text-center pb-2">
                                <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                                    <UserPlus className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle className="text-2xl">External Candidate</CardTitle>
                                <CardDescription className="text-base mt-2">
                                    For candidates outside the institution seeking admission
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto pt-6">
                                <Button
                                    variant="outline"
                                    className="w-full text-base py-6 hover:bg-primary hover:text-white"
                                    onClick={() => navigate('/apply/external')}
                                >
                                    Continue as External Candidate
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <PublicFooter />
        </div>
    );
};

export default CandidateSelection;
