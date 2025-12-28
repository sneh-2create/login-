import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-xl text-gray-600 mb-8">Page not found</p>
            <Link
                to="/"
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
                Go to Dashboard
            </Link>
        </div>
    );
};
