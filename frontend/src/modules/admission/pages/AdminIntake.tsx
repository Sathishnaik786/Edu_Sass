import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { admissionApi } from '../api';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '../components/StatusBadge';
import { IntakeDecisionModal } from '../components/IntakeDecisionModal';
import { Button } from '@/components/ui/button';
import { Check, X, UserPlus, Mail, Phone, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface PendingApplication {
    id: string;
    reference_number: string;
    email: string;
    personal_details: {
        full_name: string;
        mobile: string;
        category: string;
    };
    created_at: string;
    status: string;
    candidate_type: string;
    applicant_id: string | null;
}

const AdminIntake: React.FC = () => {
    const [applications, setApplications] = useState<PendingApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<{ open: boolean; type: 'APPROVE' | 'REJECT'; id: string | null }>({
        open: false,
        type: 'APPROVE',
        id: null
    });

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const res = await admissionApi.getPendingIntake();
            if (res.success) {
                setApplications(res.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load pending applications");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (type: 'APPROVE' | 'REJECT', id: string) => {
        setModal({ open: true, type, id });
    };

    const onConfirmDecision = async (id: string, reason?: string) => {
        if (modal.type === 'APPROVE') {
            await admissionApi.approveIntake(id);
            toast.success("Application approved & User created successfully");
        } else {
            await admissionApi.rejectIntake(id); // API needs separate update if reason support added
            toast.success("Application rejected");
        }

        // Remove from list optimistically
        setApplications(prev => prev.filter(app => app.id !== id));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="External Intake"
                description="Review and approve external PhD applications. Approving will generate system access for the applicant."
            />

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
                    <h3 className="font-semibold text-sm text-gray-700">Pending Queue</h3>
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
                        {loading ? '...' : applications.length}
                    </span>
                </div>

                {loading ? (
                    <div className="p-6 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-4 w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : applications.length === 0 ? (
                    <EmptyState
                        title="No Pending Applications"
                        description="There are no external applicants waiting for approval."
                        className="py-12"
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                                <tr>
                                    <th className="px-6 py-3">Applicant</th>
                                    <th className="px-6 py-3">Reference</th>
                                    <th className="px-6 py-3">Submitted</th>
                                    <th className="px-6 py-3">Source</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {applications.map((app) => (
                                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">
                                                    {app.personal_details?.full_name || 'Unknown'}
                                                </span>
                                                <span className="text-gray-500 text-xs flex items-center gap-1">
                                                    <Mail className="h-3 w-3" /> {app.email}
                                                </span>
                                                <span className="text-gray-500 text-xs flex items-center gap-1">
                                                    <Phone className="h-3 w-3" /> {app.personal_details?.mobile || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-600">
                                            {app.reference_number}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                                External
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 text-destructive border-destructive/20 hover:bg-destructive/10"
                                                    onClick={() => handleAction('REJECT', app.id)}
                                                >
                                                    <X className="h-4 w-4 mr-1" /> Reject
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="h-8 bg-green-600 hover:bg-green-700 text-white"
                                                    onClick={() => handleAction('APPROVE', app.id)}
                                                >
                                                    <UserPlus className="h-4 w-4 mr-1" /> Approve
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <IntakeDecisionModal
                open={modal.open}
                type={modal.type}
                applicationId={modal.id}
                onConfirm={onConfirmDecision}
                onClose={() => setModal({ ...modal, open: false })}
            />
        </div>
    );
};

export default AdminIntake;
