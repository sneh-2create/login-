import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

// Import remote module
// @ts-ignore
const RemoteAdmissionApp = React.lazy(() => import('admission_crm/App'));

export const AdmissionPage: React.FC = () => {
    const location = useLocation();
    const isPrint = location.pathname.includes('/print/');

    return (
        <Suspense fallback={
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-gray-500">Loading Module...</span>
            </div>
        }>
            <div className={isPrint ? "w-full" : "w-full max-w-full min-w-0 h-full"}>
                <RemoteAdmissionApp />
            </div>
        </Suspense>
    );
};
