import React, { useEffect, useState } from 'react';
import { admissionApi } from '../api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const FeePaymentList: React.FC = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const res = await admissionApi.getPendingFees();
                if (res.success) {
                    setApplications(res.data);
                }
            } catch (error) {
                console.error(error);
                // In demo, we might be Admin checking list or Applicant checking own.
                // For simplified demo, assume listing all eligible if Admin. 
                // If 403, maybe show "Check Status" for Applicant.
            } finally {
                setLoading(false);
            }
        };
        fetchApps();
    }, []);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold tracking-tight mb-6">Pending Fee Payments</h2>
            <div className="grid gap-4">
                {loading ? (
                    <p>Loading...</p>
                ) : applications.length === 0 ? (
                    <p>No applications pending fee payment.</p>
                ) : (
                    applications.map((app) => (
                        <Card key={app.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium">
                                    {app.reference_number}
                                </CardTitle>
                                <Link to={`/admission/fees/pay/${app.id}`}>
                                    <Button size="sm" className="bg-blue-600">Pay Now</Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground">
                                    <p>Candidate: {app.payload?.personal_details?.full_name}</p>
                                    <p>Type: {app.candidate_type}</p>
                                    <p>Documents Verified: {new Date(app.updated_at).toLocaleDateString()}</p>
                                    <p className="font-bold mt-2 text-black">Fee: ₹1000.00</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default FeePaymentList;
