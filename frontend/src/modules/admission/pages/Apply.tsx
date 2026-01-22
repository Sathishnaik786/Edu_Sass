import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { admissionApi } from '../api';
import { useNavigate } from 'react-router-dom';

const ApplyPage: React.FC = () => {
    const navigate = useNavigate();
    const [candidateType, setCandidateType] = useState<'INTERNAL' | 'EXTERNAL' | null>(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        // General
        candidate_type: 'INTERNAL', // default, will update
        email: '',
        mobile: '',
        identity_document: '',

        personal_details: {
            full_name: '',
            dob: '',
            gender: '',
            contact_number: '',
            address: ''
        },
        academic_details: {
            qualifying_degree: '',
            university: '',
            year_of_passing: '' as any,
            percentage: '' as any
        },
        research_interest: {
            area_of_interest: '',
            proposed_topic: ''
        },
        category: 'General',
        is_exemption_requested: false
    });

    const handleChange = (section: string, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                // @ts-ignore
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleRootChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleTypeSelect = (type: 'INTERNAL' | 'EXTERNAL') => {
        setCandidateType(type);
        setFormData(prev => ({ ...prev, candidate_type: type }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("handleSubmit triggered");

        try {
            setLoading(true);
            console.log("Submitting PET application...");
            console.log("Form Data:", formData);
            console.log("Candidate Type:", candidateType);

            const isInternal = candidateType === 'INTERNAL';

            // Explicit check before API call
            if (!formData.candidate_type) {
                console.error("Missing candidate_type in formData");
                throw new Error("Candidate type is missing");
            }

            console.log("Calling admissionApi.createPetApplication...");
            const res = await admissionApi.createPetApplication(formData, isInternal);
            console.log("API Response:", res);

            alert(`Application Submitted! Reference Number: ${res.data.reference_number}`);

            // Navigate on success
            navigate('/admission/status');

        } catch (error: any) {
            console.error("Submit error details:", error);
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
            }
            alert(error?.response?.data?.message || error.message || 'Error submitting application');
        } finally {
            console.log("Resetting loading state");
            setLoading(false);
        }
    };

    if (!candidateType) {
        return (
            <div className="p-8 max-w-2xl mx-auto text-center space-y-6">
                <h1 className="text-3xl font-bold">Admission Portal</h1>
                <p className="text-gray-600">Please select your candidate type to proceed.</p>
                <div className="flex gap-4 justify-center">
                    <Card className="w-64 cursor-pointer hover:border-primary transition p-4" onClick={() => handleTypeSelect('INTERNAL')}>
                        <CardHeader>
                            <CardTitle>Internal Candidate</CardTitle>
                            <CardDescription>Current Students & Staff</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="w-64 cursor-pointer hover:border-primary transition p-4" onClick={() => handleTypeSelect('EXTERNAL')}>
                        <CardHeader>
                            <CardTitle>External Candidate</CardTitle>
                            <CardDescription>New Applicants</CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold tracking-tight">
                    PET Application ({candidateType})
                </h2>
                <Button variant="outline" onClick={() => setCandidateType(null)}>Change Type</Button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                    {/* External Specific Fields */}
                    {candidateType === 'EXTERNAL' && (
                        <Card className="border-blue-200 bg-blue-50/50">
                            <CardHeader>
                                <CardTitle>Applicant Identity</CardTitle>
                                <CardDescription>Required for external candidates</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" required value={formData.email} onChange={(e) => handleRootChange('email', e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="mobile">Mobile Number</Label>
                                    <Input id="mobile" required value={formData.mobile} onChange={(e) => handleRootChange('mobile', e.target.value)} />
                                </div>
                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="identity">Identity Document (Aadhaar/Passport)</Label>
                                    <Input id="identity" required value={formData.identity_document} onChange={(e) => handleRootChange('identity_document', e.target.value)} />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Personal Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="full_name">Full Name</Label>
                                <Input id="full_name" required value={formData.personal_details.full_name} onChange={(e) => handleChange('personal_details', 'full_name', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="dob">Date of Birth</Label>
                                <Input id="dob" type="date" required value={formData.personal_details.dob} onChange={(e) => handleChange('personal_details', 'dob', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Input id="gender" required value={formData.personal_details.gender} onChange={(e) => handleChange('personal_details', 'gender', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="contact">Contact Number (Alt)</Label>
                                <Input id="contact" required value={formData.personal_details.contact_number} onChange={(e) => handleChange('personal_details', 'contact_number', e.target.value)} />
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" required value={formData.personal_details.address} onChange={(e) => handleChange('personal_details', 'address', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Academic Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Academic Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="degree">Qualifying Degree</Label>
                                <Input id="degree" required value={formData.academic_details.qualifying_degree} onChange={(e) => handleChange('academic_details', 'qualifying_degree', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="university">University</Label>
                                <Input id="university" required value={formData.academic_details.university} onChange={(e) => handleChange('academic_details', 'university', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="yop">Year of Passing</Label>
                                <Input id="yop" type="number" required value={formData.academic_details.year_of_passing} onChange={(e) => handleChange('academic_details', 'year_of_passing', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="percentage">Percentage/CGPA</Label>
                                <Input id="percentage" type="number" required value={formData.academic_details.percentage} onChange={(e) => handleChange('academic_details', 'percentage', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Research Interest */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Research Interest</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="area">Area of Interest</Label>
                                <Input id="area" required value={formData.research_interest.area_of_interest} onChange={(e) => handleChange('research_interest', 'area_of_interest', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="topic">Proposed Topic (Optional)</Label>
                                <Input id="topic" value={formData.research_interest.proposed_topic} onChange={(e) => handleChange('research_interest', 'proposed_topic', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit */}
                    <div className="flex justify-end">
                        <Button type="submit" size="lg" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ApplyPage;
