import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { admissionApi } from '../api';
import { PageHeader } from '@/components/common/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { CheckCircle, XCircle, FileText, User, ExternalLink } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

const PetExemptionReview: React.FC = () => {
    const [exemptions, setExemptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [remarks, setRemarks] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchExemptions();
    }, []);

    const fetchExemptions = async () => {
        try {
            setLoading(true);
            const res = await admissionApi.getPendingExemptions();
            if (res.success) {
                setExemptions(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch exemptions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (exemptionId: string, decision: 'APPROVE' | 'REJECT') => {
        const reviewRemarks = remarks[exemptionId];
        if (decision === 'REJECT' && !reviewRemarks) {
            alert('Remarks are mandatory for rejection.');
            return;
        }

        try {
            setProcessing(exemptionId);
            await admissionApi.reviewPetExemption(exemptionId, { decision, remarks: reviewRemarks || '' });
            alert(`Exemption ${decision === 'APPROVE' ? 'Approved' : 'Rejected'} successfully.`);
            fetchExemptions();
        } catch (error: any) {
            alert(error.response?.data?.message || error.message || 'Operation failed');
        } finally {
            setProcessing(null);
        }
    };

    const handleRemarkChange = (id: string, value: string) => {
        setRemarks(prev => ({ ...prev, [id]: value }));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="PET Exemption Review"
                description="Review and process PET exemption requests from internal candidates."
            />

            <div className="grid gap-6">
                {loading ? (
                    Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)
                ) : exemptions.length === 0 ? (
                    <EmptyState
                        title="No Pending Reviews"
                        description="All PET exemption requests have been processed."
                        icon={CheckCircle}
                        className="py-20"
                    />
                ) : (
                    exemptions.map((ex) => (
                        <Card key={ex.id} className="overflow-hidden border-l-4 border-l-primary">
                            <CardHeader className="bg-muted/30 pb-4 border-b">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            Application: {ex.admission_applications?.reference_number}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2">
                                            <User className="h-3.5 w-3.5" />
                                            Requested by {ex.admission_applications?.payload?.personal_details?.full_name || 'Internal Candidate'}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status="PENDING" />
                                        <span className="text-xs text-muted-foreground">Requested on {new Date(ex.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-primary" />
                                                Exemption Reason
                                            </h4>
                                            <p className="text-sm bg-muted/50 p-4 rounded-lg border border-border/50 italic">
                                                "{ex.exemption_reason}"
                                            </p>
                                        </div>

                                        {ex.supporting_documents && ex.supporting_documents.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold mb-2">Supporting Documents</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {ex.supporting_documents.map((doc: string, idx: number) => (
                                                        <Button key={idx} variant="outline" size="sm" asChild className="gap-2">
                                                            <a href={doc} target="_blank" rel="noopener noreferrer">
                                                                Document {idx + 1} <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-semibold">Reviewer Remarks</h4>
                                            <Textarea
                                                placeholder="Enter evaluation remarks (mandatory for rejection)..."
                                                value={remarks[ex.id] || ''}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleRemarkChange(ex.id, e.target.value)}
                                                className="min-h-[100px]"
                                            />
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                            <Button
                                                className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                                                onClick={() => handleAction(ex.id, 'APPROVE')}
                                                disabled={processing === ex.id}
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                                {processing === ex.id ? 'Processing...' : 'Approve Exemption'}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                className="flex-1 gap-2"
                                                onClick={() => handleAction(ex.id, 'REJECT')}
                                                disabled={processing === ex.id}
                                            >
                                                <XCircle className="h-4 w-4" />
                                                {processing === ex.id ? 'Processing...' : 'Reject Request'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default PetExemptionReview;
