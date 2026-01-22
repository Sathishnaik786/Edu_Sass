import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ApplicationCardProps {
    id: string;
    status: string;
    date: string;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ id, status, date }) => {
    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Application #{id.substring(0, 8)}</CardTitle>
                <CardDescription>Submitted on {new Date(date).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                        <span className="font-semibold">Status: {status}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline">View Details</Button>
            </CardFooter>
        </Card>
    );
};

export default ApplicationCard;
