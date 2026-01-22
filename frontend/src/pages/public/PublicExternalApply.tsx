
import React from 'react';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicFooter } from '@/components/public/PublicFooter';
import ApplyPage from '@/modules/admission/pages/Apply';

const ExternalApplyPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <PublicNavbar />
            <main className="flex-1 py-12">
                <ApplyPage />
            </main>
            <PublicFooter />
        </div>
    );
};

export default ExternalApplyPage;
