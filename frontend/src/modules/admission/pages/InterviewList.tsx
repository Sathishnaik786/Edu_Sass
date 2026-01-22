import React, { useEffect, useState } from 'react';
import { admissionApi } from '../api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';

import { PageHeader } from '@/components/common/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '../components/StatusBadge';

const InterviewList: React.FC = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const res = await admissionApi.getEligibleInterviews();
                if (res.success) {
                    setApplications(res.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchApps();
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="Interview Scheduling"
                description="Manage and schedule interviews for eligible PhD candidates."
            />

            <div className="grid gap-4">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-40 w-full rounded-xl" />
                    ))
                ) : applications.length === 0 ? (
                    <EmptyState
                        title="No Interviews to Schedule"
                        description="All eligible candidates have been processed or are awaiting scrutiny."
                        icon={Users}
                        className="p-12 border-dashed"
                    />
                ) : (
                    applications.map((app) => (
                        <Card key={app.id} className="hover:border-primary/50 transition-colors group border-l-4 border-l-primary">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-bold">
                                        {app.reference_number}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={app.status} />
                                        <span className="text-xs text-muted-foreground">• Scrutiny Approved on {new Date(app.updated_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <Link to={`/admission/interviews/schedule/${app.id}`}>
                                    <Button size="sm" variant="default" className="gap-2">Schedule Interview</Button>
                                </Link>
                            </CardHeader>
                            <CardContent className="border-t pt-4 bg-muted/5">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div className="space-y-1 col-span-1 md:col-span-2">
                                        <p className="text-muted-foreground">Candidate Name</p>
                                        <p className="font-medium">{app.payload?.personal_details?.full_name || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <p className="text-muted-foreground">Research Interest</p>
                                        <p className="font-medium line-clamp-1">{app.payload?.research_interest?.area_of_interest || 'N/A'}</p>
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

export default InterviewList;
