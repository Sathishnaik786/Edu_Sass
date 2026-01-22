import React, { useEffect, useState } from 'react';
import { admissionApi } from '../api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from 'react-router-dom';

import { PageHeader } from '@/components/common/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';

const ScrutinyList: React.FC = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const res = await admissionApi.getPendingScrutiny();
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
                title="Pending Scrutiny"
                description="Review application documents and academic credentials."
            />

            <div className="grid gap-4">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-40 w-full rounded-xl" />
                    ))
                ) : applications.length === 0 ? (
                    <EmptyState
                        title="No Pending Scrutiny"
                        description="All applications have been processed. Great job!"
                        icon={Search}
                        className="p-12 border-dashed"
                    />
                ) : (
                    applications.map((app) => (
                        <Card key={app.id} className="hover:border-primary/50 transition-colors group">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-bold">
                                        {app.reference_number || 'No Ref'}
                                    </CardTitle>
                                    <CardDescription>
                                        Submitted on {new Date(app.created_at).toLocaleDateString()}
                                    </CardDescription>
                                </div>
                                <Link to={`/admission/scrutiny/${app.id}`}>
                                    <Button size="sm">Review Application</Button>
                                </Link>
                            </CardHeader>
                            <CardContent className="border-t pt-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground">Type</p>
                                        <p className="font-medium">{app.candidate_type}</p>
                                    </div>
                                    <div className="space-y-1 col-span-1 md:col-span-2">
                                        <p className="text-muted-foreground">Candidate Name</p>
                                        <p className="font-medium">{app.payload?.personal_details?.full_name || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground">Faculty/Dept</p>
                                        <p className="font-medium">{app.payload?.academic_details?.faculty || 'N/A'}</p>
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

export default ScrutinyList;
