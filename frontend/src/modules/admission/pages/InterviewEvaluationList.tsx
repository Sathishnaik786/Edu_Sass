import React, { useEffect, useState } from 'react';
import { admissionApi } from '../api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const InterviewEvaluationList: React.FC = () => {
    const [interviews, setInterviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const res = await admissionApi.getPendingEvaluations();
                if (res.success) {
                    setInterviews(res.data);
                }
            } catch (error) {
                console.error(error);
                alert('Unauthorized or Error fetching pending evaluations');
            } finally {
                setLoading(false);
            }
        };
        fetchInterviews();
    }, []);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold tracking-tight mb-6">Pending Interview Evaluation (DRC)</h2>
            <div className="grid gap-4">
                {loading ? (
                    <p>Loading...</p>
                ) : interviews.length === 0 ? (
                    <p>No interviews pending evaluation.</p>
                ) : (
                    interviews.map((interview) => (
                        <Card key={interview.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium">
                                    {new Date(interview.interview_date).toLocaleString()}
                                </CardTitle>
                                <Link to={`/admission/interviews/evaluate/${interview.id}`}>
                                    <Button size="sm">Evaluate</Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground">
                                    <p>Ref: {interview.admission_applications?.reference_number}</p>
                                    <p>Mode: {interview.interview_mode}</p>
                                    <p>Candidate: {interview.admission_applications?.payload?.personal_details?.full_name}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default InterviewEvaluationList;
