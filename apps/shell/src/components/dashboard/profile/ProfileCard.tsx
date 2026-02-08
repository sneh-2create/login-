
import React from 'react';
import { EmployeeProfile } from '@od-erp/types';

interface ProfileCardProps {
    profile: EmployeeProfile;
    loading?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, loading }) => {
    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm h-full animate-pulse">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full -mr-16 -mt-16 z-0"></div>
            <div className="relative z-10 flex flex-col items-center">
                <div className="mb-4">
                    <img
                        src={profile.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`}
                        alt={profile.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                    />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{profile.name}</h3>
                <div className="w-full mt-4 space-y-2">
                    <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-gray-500 text-sm">Number</span>
                        <span className="font-medium text-gray-700">{profile.mobile}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-gray-500 text-sm">Email</span>
                        <span className="font-medium text-gray-700 truncate max-w-[200px]" title={profile.email}>{profile.email}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
