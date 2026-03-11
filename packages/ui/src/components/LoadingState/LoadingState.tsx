import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
    );
};
