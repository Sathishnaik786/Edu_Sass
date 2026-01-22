
import React, { useEffect, useState } from 'react';
import { admissionApi } from '../api';
import { PageHeader } from '@/components/common/PageHeader';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, Search, ExternalLink, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '../components/StatusBadge';

const MyApplications: React.FC = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const res = await admissionApi.getMyApplications();
                if (res.success) setApplications(res.data);
            } catch (error) {
                console.error("Failed to fetch applications", error);
            } finally {
                setLoading(false);
            }
        };
        fetchApps();
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="My Applications"
                description="View and manage your submitted applications."
                actions={
                    <Link to="/admission/apply">
                        <Button className="gap-2"><FileText className="h-4 w-4" /> New Application</Button>
                    </Link>
                }
            />

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                            <tr>
                                <th className="px-6 py-4">Reference Number</th>
                                <th className="px-6 py-4">Program / Type</th>
                                <th className="px-6 py-4">Date Submitted</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                                        <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-24 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : applications.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Search className="h-8 w-8 text-muted-foreground/30" />
                                            <p className="font-medium text-foreground">No applications found</p>
                                            <p className="text-muted-foreground text-xs">Start a new application to apply for PhD.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                applications.map((app) => (
                                    <tr key={app.id} className="hover:bg-muted/5 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            {app.reference_number || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {app.candidate_type || 'PhD Scholar'}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={app.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link to={`/admission/status`}>
                                                    View Details <ExternalLink className="ml-1 h-3 w-3" />
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyApplications;
