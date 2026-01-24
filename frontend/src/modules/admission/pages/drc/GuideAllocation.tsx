import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { admissionApi } from '../../api';
import { CheckCircle2, UserPlus, Search, Clock } from 'lucide-react';

// Using inline styles/classes instead of Badge/Table if components missing
const SimpleBadge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
        {children}
    </span>
);

export const GuideAllocation = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [guideId, setGuideId] = useState('');
    const [remarks, setRemarks] = useState('');
    const [processing, setProcessing] = useState(false);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await admissionApi.getPendingGuides();
            if (res.success) setApplications(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleAllocate = async () => {
        if (!guideId) {
            alert("Guide Faculty ID is required");
            return;
        }

        setProcessing(true);
        try {
            const res = await admissionApi.allocateGuide(selectedApp.id, {
                guide_faculty_id: guideId, // API expects this key
                remarks
            });
            if (res.success) {
                alert("Guide Allocated Successfully");
                setSelectedApp(null);
                setGuideId('');
                setRemarks('');
                fetchPending();
            }
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to allocate guide");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Guide Allocation</h2>
                    <p className="text-muted-foreground">Allocate research guides to eligible candidates (Fee Verified).</p>
                </div>
                <Button onClick={fetchPending} variant="outline" size="sm">
                    Refresh List
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Allocations</CardTitle>
                    <CardDescription>{applications.length} candidates waiting for guide allocation.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : applications.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No pending applications found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {applications.map((app) => (
                                <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm text-muted-foreground">{app.reference_number}</span>
                                            <SimpleBadge className="bg-green-100 text-green-800 border-green-200">
                                                Fee Verified
                                            </SimpleBadge>
                                        </div>
                                        <p className="font-medium text-lg leading-none">
                                            {app.payload?.personal_details?.full_name || 'N/A'}
                                        </p>
                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                            <span>{app.payload?.email}</span>
                                            <span>•</span>
                                            <span>{app.payload?.research_interest?.area_of_interest || 'N/A'}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                            <Clock className="h-3 w-3" /> updated {new Date(app.updated_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <Button size="sm" onClick={() => setSelectedApp(app)} className="gap-2">
                                        <UserPlus className="h-4 w-4" /> Allocate
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Allocate Guide</DialogTitle>
                        <DialogDescription>
                            Assign a research faculty to {selectedApp?.payload?.personal_details?.full_name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="guideId">Faculty ID (UUID)</Label>
                            <Input
                                id="guideId"
                                placeholder="Enter Faculty User ID"
                                value={guideId}
                                onChange={(e) => setGuideId(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Verify the Faculty ID carefully.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="remarks">Remarks (Optional)</Label>
                            <Input
                                id="remarks"
                                placeholder="Any notes for the student..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedApp(null)} disabled={processing}>Cancel</Button>
                        <Button onClick={handleAllocate} disabled={processing}>
                            {processing ? 'Allocating...' : 'Confirm Allocation'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default GuideAllocation;
