import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { admissionApi } from '../api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/common/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, User, BookOpen, AlertCircle, XCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';

const GuideConfirmation: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [application, setApplication] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [remarks, setRemarks] = useState('');

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

    const handleAction = async (decision: 'ACCEPT' | 'REJECT') => {
        if (!id) return;
        if (decision === 'REJECT' && !remarks) {
            alert('Please provide remarks for rejecting the scholar.');
            return;
        }

        try {
            setSubmitting(true);
            const res = await admissionApi.submitGuideAcceptance(id, { decision, remarks });
            if (res.success) {
                alert(`Scholar ${decision === 'ACCEPT' ? 'Accepted' : 'Rejected'} successfully!`);
                navigate('/admission/overview'); // Or guide dashboard
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Action failed');
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

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="Scholar Supervision Confirmation"
                description="Review the scholar's research profile and confirm your supervision acceptance."
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
                                <User className="h-4 w-4" /> Scholar Details
                            </h3>
                            <div className="space-y-2">
                                <p className="text-lg font-medium">{application.payload?.personal_details?.full_name}</p>
                                <p className="text-sm text-muted-foreground">Candidate Type: {application.candidate_type}</p>
                                <p className="text-sm text-muted-foreground">Category: {application.payload?.category}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <BookOpen className="h-4 w-4" /> Proposed Research
                            </h3>
                            <div className="space-y-2">
                                <p className="text-lg font-medium">{application.payload?.research_interest?.area_of_interest}</p>
                                <p className="text-sm italic">"{application.payload?.research_interest?.proposed_topic}"</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label htmlFor="remarks">Supervision Remarks (Mandatory for rejection)</Label>
                        <Textarea
                            id="remarks"
                            placeholder="Enter any specific requirements or comments for this scholar..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="min-h-[120px]"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                        <Button
                            className="flex-1 h-12 text-lg gap-2 bg-green-600 hover:bg-green-700"
                            size="lg"
                            onClick={() => handleAction('ACCEPT')}
                            disabled={submitting || application.status === 'ADMISSION_CONFIRMED'}
                        >
                            <CheckCircle2 className="h-5 w-5" />
                            {application.status === 'ADMISSION_CONFIRMED' ? 'Admission Confirmed' : 'Accept Supervision'}
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1 h-12 text-lg gap-2"
                            size="lg"
                            onClick={() => handleAction('REJECT')}
                            disabled={submitting || application.status === 'ADMISSION_CONFIRMED'}
                        >
                            <XCircle className="h-5 w-5" />
                            Reject Scholar
                        </Button>
                        <Button variant="outline" className="h-12" size="lg" onClick={() => navigate(-1)}>
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default GuideConfirmation;
