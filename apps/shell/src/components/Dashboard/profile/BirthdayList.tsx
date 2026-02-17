
import React from 'react';
import { ProfileBirthdayEmployee } from '@od-erp/types';
import moment from 'moment';

interface BirthdayListProps {
    birthdays: ProfileBirthdayEmployee[];
    loading?: boolean;
}

export const BirthdayList: React.FC<BirthdayListProps> = ({ birthdays, loading }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800">Current Month Birthday(s)</h3>
                <span className="text-sm text-gray-500">{moment().format('DD/MM/YYYY')}</span>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-gray-400">Loading birthdays...</div>
                </div>
            ) : birthdays && birthdays.length > 0 ? (
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {birthdays.map((employee) => (
                        <div key={employee._id} className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <img
                                    src={employee.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=random`}
                                    alt={employee.name}
                                    className="w-10 h-10 rounded-full"
                                />
                                <div>
                                    <h4 className="font-semibold text-gray-800 text-sm">{employee.name}</h4>
                                    <p className="text-xs text-gray-500">{employee.department}</p>
                                    <p className="text-xs text-gray-400">{moment(employee.dob).format('DD/MM/YYYY')}</p>
                                </div>
                            </div>
                            <div className="bg-pink-100 text-pink-600 px-2 py-1 rounded text-xs font-medium">
                                Birthday
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <div className="bg-gray-100 p-4 rounded-full mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h4 className="text-gray-800 font-medium">No Data Found</h4>
                    <p className="text-gray-500 text-sm">No birthdays this month</p>
                </div>
            )}
        </div>
    );
};
