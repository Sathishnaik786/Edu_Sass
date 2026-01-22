import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { admissionApi } from '../api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const ScrutinyReview: React.FC = () => {
    const { id } = useParams<{ id: string }>();
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

    const handleDecision = async (decision: 'APPROVE' | 'REJECT') => {
        if (!id) return;
        if (decision === 'REJECT' && !remarks) {
            alert('Remarks are mandatory for rejection.');
            return;
        }
        if (!confirm(`Are you sure you want to ${decision} this application?`)) return;

        setLoading(true);
        try {
            await admissionApi.submitScrutinyDecision(id, decision, remarks);
            alert(`Application ${decision}D`);
            navigate('/admission/scrutiny');
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Error submitting decision');
        } finally {
            setLoading(false);
        }
    };

    if (!app) return <div className="p-6">Loading...</div>;

    const { payload } = app;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Scrutiny Review</h2>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {app.status}
                </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Personal Details</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong>Name:</strong> {payload?.personal_details?.full_name}</p>
                        <p><strong>DOB:</strong> {payload?.personal_details?.dob}</p>
                        <p><strong>Gender:</strong> {payload?.personal_details?.gender}</p>
                        <p><strong>Contact:</strong> {payload?.personal_details?.contact_number}</p>
                        <p><strong>Email:</strong> {payload?.email || 'N/A (Internal)'}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Academic Details</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong>Degree:</strong> {payload?.academic_details?.qualifying_degree}</p>
                        <p><strong>University:</strong> {payload?.academic_details?.university}</p>
                        <p><strong>Year:</strong> {payload?.academic_details?.year_of_passing}</p>
                        <p><strong>Percentage:</strong> {payload?.academic_details?.percentage}%</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-t-4 border-yellow-400">
                <CardHeader><CardTitle>DRC Decision</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="remarks">Remarks (Required for Rejection)</Label>
                        <Input
                            id="remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Enter scrutiny comments..."
                        />
                    </div>
                    <div className="flex gap-4 pt-2">
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => handleDecision('APPROVE')}
                            disabled={loading}
                        >
                            APPROVE FOR INTERVIEW
                        </Button>
                        <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() => handleDecision('REJECT')}
                            disabled={loading}
                        >
                            REJECT APPLICATION
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ScrutinyReview;
