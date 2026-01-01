import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Import remote module
// @ts-ignore
const RemoteAdmissionApp = React.lazy(() => import('admission_crm/App'));

export const AdmissionPage: React.FC = () => {
    return (
        <Suspense fallback={
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-gray-500">Loading Module...</span>
            </div>
        }>
            <RemoteAdmissionApp />
        </Suspense>
    );
};
