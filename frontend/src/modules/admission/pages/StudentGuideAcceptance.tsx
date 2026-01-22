import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { admissionApi } from '../api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, User, BookOpen, AlertCircle } from 'lucide-react';

const StudentGuideAcceptance: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [application, setApplication] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchApp = async () => {
            if (!id) return;
            try {
                const res = await admissionApi.getApplicationById(id);
                if (res.success) {
                    setApplication(res.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchApp();
    }, [id]);

    const handleAccept = async () => {
        if (!id) return;
        try {
            setSubmitting(true);
            const res = await admissionApi.submitStudentGuideAcceptance(id);
            if (res.success) {
                alert('Guide allocation accepted successfully!');
                navigate('/admission/status');
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to accept allocation');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-12 w-1/3" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!application) return <div>Application not found</div>;

    const isInternal = application.candidate_type === 'INTERNAL';

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="Confirm Guide Allocation"
                description="Review your clinical/research guide supervisor and confirm your acceptance."
            />

            <Card className="border-primary/20 shadow-lg">
                <CardHeader className="bg-primary/5 border-b">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl">{application.reference_number}</CardTitle>
                            <CardDescription>PhD Research Scholar Candidate</CardDescription>
                        </div>
                        <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase">
                            Stage: {application.status}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-8 space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <User className="h-4 w-4" /> Personal Details
                            </h3>
                            <div className="space-y-2">
                                <p className="text-lg font-medium">{application.payload?.personal_details?.full_name}</p>
                                <p className="text-sm text-muted-foreground">{application.payload?.personal_details?.address}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <BookOpen className="h-4 w-4" /> Research Area
                            </h3>
                            <div className="space-y-2">
                                <p className="text-lg font-medium">{application.payload?.research_interest?.area_of_interest}</p>
                                <p className="text-sm italic">"{application.payload?.research_interest?.proposed_topic}"</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-amber-50 border border-amber-100 rounded-xl space-y-4">
                        <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" /> Supervisor Allocation
                        </h3>
                        <div className="space-y-3">
                            <p className="text-amber-800">
                                The Department Research Committee (DRC) has provisionally allocated a research supervisor for your PhD work.
                                Please confirm your acceptance of this allocation to proceed with final admission confirmation.
                            </p>
                            <div className="bg-white/80 p-4 rounded-lg border border-amber-200">
                                <p className="text-sm text-amber-600 font-medium mb-1">Allocated Faculty Guide</p>
                                <p className="text-xl font-bold text-amber-900 leading-tight">Prof. Dr. Faculty Member</p>
                                <p className="text-sm text-amber-700 mt-1">Specialization: {application.payload?.research_interest?.area_of_interest}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                        <Button
                            className="flex-1 h-12 text-lg gap-2"
                            size="lg"
                            onClick={handleAccept}
                            disabled={submitting || application.status === 'GUIDE_ACCEPTED_BY_STUDENT'}
                        >
                            <CheckCircle2 className="h-5 w-5" />
                            {application.status === 'GUIDE_ACCEPTED_BY_STUDENT' ? 'Already Accepted' : 'Confirm & Accept Guide'}
                        </Button>
                        <Button variant="outline" className="h-12" size="lg" onClick={() => navigate(-1)}>
                            Go Back
                        </Button>
                    </div>

                    <p className="text-center text-xs text-muted-foreground italic">
                        By clicking "Confirm & Accept", you agree to work under the supervision of the allocated guide for your doctoral research.
                        This action is non-reversible through the portal.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default StudentGuideAcceptance;
