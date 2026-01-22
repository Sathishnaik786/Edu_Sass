import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { admissionApi } from '../api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const FeePaymentForm: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // applicationId
    const navigate = useNavigate();
    const [app, setApp] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
    const [ref, setRef] = useState(''); // Transaction ID for offline

    useEffect(() => {
        const fetchApp = async () => {
            if (!id) return;
            try {
                const res = await admissionApi.getApplicationById(id);
                if (res.success) setApp(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchApp();
    }, [id]);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        if (mode === 'OFFLINE' && !ref) {
            alert('Reference/Receipt No is required for Offline payment');
            return;
        }

        if (!confirm('Confirm Payment?')) return;

        setLoading(true);
        try {
            await admissionApi.payFee(id, {
                amount: 1000, // Fixed fee for demo
                payment_mode: mode,
                payment_reference: ref || `ONLINE-${Date.now()}`
            });
            alert('Fee Payment Successful!');
            navigate('/admission/status');
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Payment Failed');
        } finally {
            setLoading(false);
        }
    };

    if (!app) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6 max-w-xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Secure Fee Payment</h2>

            <Card className="bg-slate-50 border-slate-200">
                <CardHeader>
                    <CardTitle>Application Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                        <span>Reference:</span>
                        <span className="font-medium">{app.reference_number}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Candidate:</span>
                        <span className="font-medium">{app.payload?.personal_details?.full_name}</span>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold">
                        <span>Total Payable:</span>
                        <span>₹1000.00</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={handlePayment} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Payment Mode</Label>
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant={mode === 'ONLINE' ? 'default' : 'outline'}
                                    onClick={() => setMode('ONLINE')}
                                >
                                    Online (Card/UPI)
                                </Button>
                                <Button
                                    type="button"
                                    variant={mode === 'OFFLINE' ? 'default' : 'outline'}
                                    onClick={() => setMode('OFFLINE')}
                                >
                                    Offline (Cash/DD)
                                </Button>
                            </div>
                        </div>

                        {mode === 'OFFLINE' && (
                            <div className="space-y-2">
                                <Label htmlFor="ref">Receipt / DD Number</Label>
                                <Input
                                    id="ref"
                                    required
                                    placeholder="Enter receipt no..."
                                    value={ref}
                                    onChange={(e) => setRef(e.target.value)}
                                />
                            </div>
                        )}

                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                            {loading ? 'Processing...' : `Pay ₹1000.00`}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default FeePaymentForm;
