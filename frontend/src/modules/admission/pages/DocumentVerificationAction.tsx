import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { admissionApi } from '../api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const DocumentVerificationAction: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // applicationId
    const navigate = useNavigate();
    const [app, setApp] = useState<any>(null);
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchApp = async () => {
            if (!id) return;
            try {
                const res = await admissionApi.getApplicationById(id);
                if (res.success) setApp(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchApp();
    }, [id]);

    const handleVerification = async (status: 'VERIFIED' | 'REJECTED') => {
        if (!id) return;
        if (!remarks) {
            alert('Remarks are required for the audit log.');
            return;
        }
        if (!confirm(`Are you sure you want to mark documents as ${status}?`)) return;

        setLoading(true);
        try {
            await admissionApi.submitVerification(id, {
                verification_status: status,
                remarks
            });
            alert(`Documents marked as ${status}`);
            navigate('/admission/verification');
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Error submitting verification');
        } finally {
            setLoading(false);
        }
    };

    if (!app) return <div className="p-6">Loading...</div>;

    const { payload } = app;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Document Verification</h2>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Candidate Details</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong>Name:</strong> {payload?.personal_details?.full_name}</p>
                        <p><strong>Category:</strong> {payload?.category}</p>
                        <p><strong>Degree:</strong> {payload?.academic_details?.qualifying_degree}</p>
                        <p><strong>University:</strong> {payload?.academic_details?.university}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>DocumentsToCheck</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <ul className="list-disc pl-4 space-y-1">
                            <li>10th / 12th Marks Cards</li>
                            <li>UG / PG Certificates</li>
                            <li>Caste Certificate (if applicable: {payload?.category})</li>
                            <li>ID Proof (Aadhar/PAN)</li>
                        </ul>
                        {payload?.candidate_type === 'EXTERNAL' && (
                            <div className="mt-4 p-2 bg-muted rounded">
                                <p className="font-semibold">External ID Doc: {payload.identity_document}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-t-4 border-blue-400">
                <CardHeader><CardTitle>Verification Decision</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="remarks">Verification Remarks / Checklist Notes</Label>
                        <Input
                            id="remarks"
                            placeholder="e.g. Verified original sets, valid caste certificate..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4 pt-2">
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => handleVerification('VERIFIED')}
                            disabled={loading}
                        >
                            DOCUMENTS VERIFIED
                        </Button>
                        <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() => handleVerification('REJECTED')}
                            disabled={loading}
                        >
                            REJECT / MISSING DOCUMENTS
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DocumentVerificationAction;
