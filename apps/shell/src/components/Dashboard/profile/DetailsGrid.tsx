
import React from 'react';
import { EmployeeProfile } from '@od-erp/types';
import moment from 'moment';

interface DetailsGridProps {
    profile: EmployeeProfile;
}

export const DetailsGrid: React.FC<DetailsGridProps> = ({ profile }) => {
    const details = [
        { label: 'Gender', value: profile.gender },
        { label: 'Country', value: profile.nationality },
        { label: 'D.O.B', value: profile.dob ? moment(profile.dob).format('DD/MM/YYYY') : '-' },
        { label: 'State', value: profile.state },
        { label: 'Mobile', value: profile.mobile },
        { label: 'City', value: profile.city },
        { label: 'Marital Status', value: profile.maritalStatus },
        { label: 'Address', value: profile.address, fullWidth: true },
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {details.map((detail, index) => (
                    <div key={index} className={`flex flex-col ${detail.fullWidth ? 'col-span-1 md:col-span-2 lg:col-span-2' : ''}`}>
                        <span className="text-gray-500 text-sm">{detail.label}</span>
                        <span className="font-medium text-gray-800">{detail.value || '-'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
