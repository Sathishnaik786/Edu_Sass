import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { admissionApi } from '../api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const GuideAllocationForm: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // applicationId
    const navigate = useNavigate();
    const [app, setApp] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [facultyId, setFacultyId] = useState('');
    const [remarks, setRemarks] = useState('');

    const [guides, setGuides] = useState<any[]>([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!id) return;
            try {
                const [appRes, guidesRes] = await Promise.all([
                    admissionApi.getApplicationById(id),
                    admissionApi.getAvailableGuides()
                ]);

                if (appRes.success) setApp(appRes.data);
                if (guidesRes.success) setGuides(guidesRes.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchInitialData();
    }, [id]);

    const handleAllocate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !facultyId) return;

        if (!confirm('Confirm Guide Allocation? This cannot be undone.')) return;

        setLoading(true);
        try {
            await admissionApi.allocateGuide(id, {
                guide_faculty_id: facultyId,
                remarks
            });
            alert('Guide Allocated Successfully!');
            navigate('/admission/status'); // Or back to list
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Allocation Failed');
        } finally {
            setLoading(false);
        }
    };

    if (!app) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6 max-w-xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Allocate Research Guide</h2>

            <Card>
                <CardHeader>
                    <CardTitle>Candidate: {app.payload?.personal_details?.full_name}</CardTitle>
                    <CardDescription>Topic: {app.payload?.research_interest?.area_of_interest}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAllocate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="guide">Select Faculty Guide</Label>
                            <select
                                id="guide"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                                value={facultyId}
                                onChange={(e) => setFacultyId(e.target.value)}
                            >
                                <option value="">Select a guide...</option>
                                {guides.map(g => (
                                    <option key={g.id} value={g.id}>{g.name} ({g.email})</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="remarks">Remarks (Optional)</Label>
                            <Input
                                id="remarks"
                                placeholder="Any specific notes..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Allocating...' : 'Confirm Allocation'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default GuideAllocationForm;
