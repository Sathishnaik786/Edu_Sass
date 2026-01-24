import React, { useEffect, useState } from 'react';
import { admissionApi } from '../api';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Link } from 'react-router-dom';
import {
    Search,
    Users,
    FileCheck,
    BookOpen,
    GraduationCap,
    ClipboardCheck,
    FileWarning,
    CreditCard
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const DRCDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        scrutinyPending: 0,
        interviewsEligible: 0,
        evaluationsPending: 0,
        verificationsPending: 0,
        guidesPending: 0,
        exemptionsPending: 0,
        feesPending: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [
                    scrutinyRes,
                    interviewsRes,
                    evalRes,
                    verifyRes,
                    guidesRes,
                    exemptionRes,
                    feesRes
                ] = await Promise.all([
                    admissionApi.getPendingScrutiny(),
                    admissionApi.getEligibleInterviews(),
                    admissionApi.getPendingEvaluations(),
                    admissionApi.getPendingVerifications(),
                    admissionApi.getPendingGuides(),
                    admissionApi.getPendingExemptions(),
                    admissionApi.getPendingFeeVerifications()
                ]);

                console.log("DRC Dashboard Scrutiny:", scrutinyRes);

                setStats({
                    scrutinyPending: scrutinyRes.success ? scrutinyRes.data.length : 0,
                    interviewsEligible: interviewsRes.success ? interviewsRes.data.length : 0,
                    evaluationsPending: evalRes.success ? evalRes.data.length : 0,
                    verificationsPending: verifyRes.success ? verifyRes.data.length : 0,
                    guidesPending: guidesRes.success ? guidesRes.data.length : 0,
                    exemptionsPending: exemptionRes.success ? exemptionRes.data.length : 0,
                    feesPending: feesRes.success ? feesRes.data.length : 0
                });

            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title={`DRC Overview`}
                description={`Welcome, ${user?.email?.split('@')[0]}. Here is the current admission status summary.`}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    Array(8).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-40 w-full rounded-xl" />
                    ))
                ) : (
                    <>
                        <Link to="/admission/scrutiny" className="block transition-transform hover:scale-[1.02]">
                            <StatCard
                                label="Pending Scrutiny"
                                value={stats.scrutinyPending}
                                icon={Search}
                                description="Applications awaiting review"
                                className="h-full border-orange-200 bg-orange-50/30"
                            />
                        </Link>

                        <Link to="/admission/pet/exemption/review" className="block transition-transform hover:scale-[1.02]">
                            <StatCard
                                label="PET Exemptions"
                                value={stats.exemptionsPending}
                                icon={FileWarning}
                                description="Exemption requests pending"
                                className="h-full border-amber-200 bg-amber-50/30"
                            />
                        </Link>

                        <Link to="/admission/interviews" className="block transition-transform hover:scale-[1.02]">
                            <StatCard
                                label="Eligible for Interview"
                                value={stats.interviewsEligible}
                                icon={Users}
                                description="Candidates ready for scheduling"
                                className="h-full"
                            />
                        </Link>

                        <Link to="/admission/interviews/evaluation" className="block transition-transform hover:scale-[1.02]">
                            <StatCard
                                label="Evaluation Pending"
                                value={stats.evaluationsPending}
                                icon={ClipboardCheck}
                                description="Interviews needing marks"
                                className="h-full"
                            />
                        </Link>

                        <Link to="/admission/verification" className="block transition-transform hover:scale-[1.02]">
                            <StatCard
                                label="Document Verification"
                                value={stats.verificationsPending}
                                icon={FileCheck}
                                description="Final doc checks pending"
                                className="h-full"
                            />
                        </Link>

                        <Link to="/admission/fees/verification" className="block transition-transform hover:scale-[1.02]">
                            <StatCard
                                label="Fee Verification"
                                value={stats.feesPending}
                                icon={CreditCard}
                                description="Payments awaiting approval"
                                className="h-full border-green-200 bg-green-50/30"
                            />
                        </Link>

                        <Link to="/admission/guides" className="block transition-transform hover:scale-[1.02]">
                            <StatCard
                                label="Guide Allocation"
                                value={stats.guidesPending}
                                icon={BookOpen}
                                description="Scholars needing supervisors"
                                className="h-full"
                            />
                        </Link>

                        <Link to="/admission/status" className="block transition-transform hover:scale-[1.02]">
                            <StatCard
                                label="Total Candidates"
                                value="--"
                                icon={GraduationCap}
                                description="View full list"
                                className="h-full bg-primary/5 border-primary/20"
                            />
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default DRCDashboard;
