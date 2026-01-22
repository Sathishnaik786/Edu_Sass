import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { admissionApi } from '../api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const InterviewEvaluationForm: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // interviewId
    const navigate = useNavigate();
    const [score, setScore] = useState<number>(0);
    const [recommendation, setRecommendation] = useState<'PASS' | 'FAIL' | ''>('');
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        if (!recommendation) {
            alert('Please select a recommendation (Pass/Fail)');
            return;
        }
        if (recommendation === 'FAIL' && !remarks) {
            alert('Remarks are mandatory for failure.');
            return;
        }
        if (!confirm('Submit Final Evaluation? This cannot be undone.')) return;

        setLoading(true);
        try {
            await admissionApi.submitEvaluation(id, {
                evaluation_score: score,
                recommendation: recommendation as 'PASS' | 'FAIL',
                remarks
            });
            alert('Evaluation submitted successfully');
            navigate('/admission/interviews/evaluation');
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Error submitting evaluation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Interview Evaluation</h2>

            <Card>
                <CardHeader>
                    <CardTitle>Enter Results</CardTitle>
                    <CardDescription>Interview ID: {id}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="score">Evaluation Score (0-100 or scale)</Label>
                            <Input
                                id="score"
                                type="number"
                                step="0.1"
                                required
                                value={score}
                                onChange={(e) => setScore(parseFloat(e.target.value))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Recommendation</Label>
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant={recommendation === 'PASS' ? 'default' : 'outline'}
                                    className={recommendation === 'PASS' ? 'bg-green-600 hover:bg-green-700' : ''}
                                    onClick={() => setRecommendation('PASS')}
                                >
                                    PASS (Select)
                                </Button>
                                <Button
                                    type="button"
                                    variant={recommendation === 'FAIL' ? 'default' : 'outline'}
                                    className={recommendation === 'FAIL' ? 'bg-red-600 hover:bg-red-700' : ''}
                                    onClick={() => setRecommendation('FAIL')}
                                >
                                    FAIL (Reject)
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="remarks">Remarks {recommendation === 'FAIL' && '*'}</Label>
                            <Input
                                id="remarks"
                                placeholder="Comments on candidate performance..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                required={recommendation === 'FAIL'}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Final Decision'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default InterviewEvaluationForm;
