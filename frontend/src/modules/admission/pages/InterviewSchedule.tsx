import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { admissionApi } from '../api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const InterviewSchedule: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [app, setApp] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Form State
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [mode, setMode] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
    const [location, setLocation] = useState(''); // Link or Venue
    const [panel, setPanel] = useState('');

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

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        if (!date || !time || !panel || !location) {
            alert('All fields are required');
            return;
        }

        if (!confirm('Confirm interview schedule? This cannot be undone.')) return;

        setLoading(true);
        try {
            const dateTime = new Date(`${date}T${time}`).toISOString();
            const payload = {
                interview_date: dateTime,
                interview_mode: mode,
                interview_location: location,
                panel_members: panel.split(',').map(s => s.trim()) // simple CSV parse
            };

            await admissionApi.scheduleInterview(id, payload);
            alert('Interview scheduled successfully!');
            navigate('/admission/interviews');
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Error scheduling interview');
        } finally {
            setLoading(false);
        }
    };

    if (!app) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Schedule Interview</h2>

            <Card>
                <CardHeader>
                    <CardTitle>Candidate: {app.payload?.personal_details?.full_name}</CardTitle>
                    <CardDescription>Ref: {app.reference_number}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSchedule} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="time">Time</Label>
                                <Input id="time" type="time" required value={time} onChange={(e) => setTime(e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Mode</Label>
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant={mode === 'ONLINE' ? 'default' : 'outline'}
                                    onClick={() => setMode('ONLINE')}
                                >
                                    Online (Video)
                                </Button>
                                <Button
                                    type="button"
                                    variant={mode === 'OFFLINE' ? 'default' : 'outline'}
                                    onClick={() => setMode('OFFLINE')}
                                >
                                    Offline (In-Person)
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">{mode === 'ONLINE' ? 'Meeting Link' : 'Venue Address'}</Label>
                            <Input
                                id="location"
                                required
                                placeholder={mode === 'ONLINE' ? 'https://meet.google.com/...' : 'Room 304, Admin Block'}
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="panel">Panel Members (Comma Separated)</Label>
                            <Input
                                id="panel"
                                required
                                placeholder="Dr. Smith, Prof. Johnson, Dr. Lee"
                                value={panel}
                                onChange={(e) => setPanel(e.target.value)}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Scheduling...' : 'Confirm Schedule'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default InterviewSchedule;
