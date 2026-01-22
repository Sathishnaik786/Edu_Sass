import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { admissionApi } from '../api';
import { PageHeader } from '@/components/common/PageHeader';
import { useNavigate } from 'react-router-dom';
import { FileWarning, CheckCircle2, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const PetExemptionRequest: React.FC = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedAppId, setSelectedAppId] = useState<string>('');
    const [reason, setReason] = useState('');
    const [docs, setDocs] = useState<string>(''); // Simplified as comma separated for now

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const res = await admissionApi.getMyApplications();
                if (res.success) {
                    // Filter for PET applications and internal candidate type
                    const internalApps = res.data.filter((app: any) =>
                        app.candidate_type === 'INTERNAL' &&
                        app.status === 'SUBMITTED' // Or other early stages
                    );
                    setApplications(internalApps);
                    if (internalApps.length > 0) {
                        setSelectedAppId(internalApps[0].id);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch applications", error);
            } finally {
                setLoading(false);
            }
        };
        fetchApps();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAppId || !reason) return;

        try {
            setSubmitting(true);
            const payload = {
                application_id: selectedAppId,
                exemption_reason: reason,
                supporting_documents: docs.split(',').map(s => s.trim()).filter(Boolean)
            };
            await admissionApi.requestPetExemption(payload);
            alert('PET Exemption request submitted successfully!');
            navigate('/admission/status');
        } catch (error: any) {
            alert(error.response?.data?.message || error.message || 'Failed to submit request');
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

    if (applications.length === 0) {
        return (
            <div className="space-y-6">
                <PageHeader title="PET Exemption Request" description="Request bypass for PhD Entrance Test." />
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                        <AlertCircle className="h-12 w-12 text-muted-foreground/50" />
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">No Eligible Applications</h3>
                            <p className="text-muted-foreground max-w-sm">
                                Only internal candidates with active PET applications can request exemptions.
                                External candidates must appear for the entrance test.
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => navigate('/admission/apply')}>Apply for PET</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="PET Exemption Request"
                description="Internal candidates may request exemption from the PET Entrance Exam based on valid credentials."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Request Details</CardTitle>
                        <CardDescription>Provide a valid reason and supporting documents for your exemption request.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="app">Select Application</Label>
                                <select
                                    id="app"
                                    className="w-full p-2 border rounded-md bg-background"
                                    value={selectedAppId}
                                    onChange={(e) => setSelectedAppId(e.target.value)}
                                    required
                                >
                                    {applications.map(app => (
                                        <option key={app.id} value={app.id}>
                                            Ref: {app.reference_number} ({app.status})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason for Exemption</Label>
                                <Textarea
                                    id="reason"
                                    placeholder="e.g. NET/SET qualified, Fellowship holder, etc."
                                    value={reason}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                                    className="min-h-[120px]"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Explain why you should be exempted from the entrance test.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="docs">Supporting Document Links (Optional)</Label>
                                <Input
                                    id="docs"
                                    placeholder="Link to certificates (comma separated)"
                                    value={docs}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDocs(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">Upload your documents to a cloud drive and share the links here.</p>
                            </div>

                            <div className="pt-4 flex justify-end gap-4">
                                <Button variant="outline" type="button" onClick={() => navigate(-1)}>Cancel</Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-amber-50/50 border-amber-100">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileWarning className="h-4 w-4 text-amber-600" />
                                Important Notice
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-amber-800 space-y-3">
                            <p>PET Exemption is only available for internal candidates (Students/Staff) who meet specific criteria.</p>
                            <p>Criteria examples:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>UGC-NET/SET Qualified</li>
                                <li>GATE/GPAT Score</li>
                                <li>CSIR Fellowship</li>
                                <li>M.Phil degree</li>
                            </ul>
                            <p className="font-medium pt-2">Requests are reviewed by the DRC. If rejected, you must appear for the mandatory PET entrance test.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Need Help?</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <p className="text-muted-foreground">Read the University Ph.D. regulations (Section 4.2) for standard exemption guidelines.</p>
                            <Button variant="link" className="p-0 h-auto text-primary">View Regulations</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PetExemptionRequest;
