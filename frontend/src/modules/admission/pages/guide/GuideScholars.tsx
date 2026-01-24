import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, RefreshCw, Calendar, FileText } from 'lucide-react';
import { admissionApi } from '../../api';

export default function GuideScholars() {
    const [scholars, setScholars] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchScholars = async () => {
        setLoading(true);
        try {
            const response = await admissionApi.getGuideScholars();
            if (response.success) {
                setScholars(response.data || []);
            }
        } catch (error: any) {
            console.error('Failed to fetch scholars:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchScholars();
    }, []);

    // Helper to format date
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Scholars</h1>
                    <p className="text-muted-foreground mt-2">
                        View all students currently allocated to you who have accepted the allocation.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchScholars} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Refresh
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Allocated Scholars
                    </CardTitle>
                    <CardDescription>
                        List of students pursuing research under your guidance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : scholars.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>No scholars found.</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
                                <div className="col-span-3">Application Ref</div>
                                <div className="col-span-3">Student Name</div>
                                <div className="col-span-3">Status</div>
                                <div className="col-span-3">Allocation Date</div>
                            </div>
                            <div className="divide-y">
                                {scholars.map((item) => (
                                    <div key={item.id} className="grid grid-cols-12 gap-4 p-4 text-sm items-center hover:bg-muted/5 transition-colors">
                                        <div className="col-span-3 font-medium flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            {item.application?.reference_number || 'N/A'}
                                        </div>
                                        <div className="col-span-3">
                                            {item.application?.full_name || 'Unknown'}
                                        </div>
                                        <div className="col-span-3">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.application?.status === 'ADMISSION_CONFIRMED'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {item.application?.status?.replace(/_/g, ' ') || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="col-span-3 text-muted-foreground flex items-center gap-2">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(item.allocated_at)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
