import React from 'react';
import { Card } from '@od-erp/ui';
import { BirthdayStudent } from '@od-erp/types';
import { Cake } from 'lucide-react';
import { format } from 'date-fns';

interface BirthdayListCardProps {
    students: BirthdayStudent[];
    loading?: boolean;
    showBatch?: boolean;
}

export const BirthdayListCard: React.FC<BirthdayListCardProps> = ({ students, loading, showBatch }) => {

    // Fallback logic for photos is handled in the UI rendering or can be pre-processed.
    // Assuming backend might send null, we can check gender in the component.

    const getGenderAvatar = (gender: string) => {
        // Simple fallback - in a real app, import specific assets
        return gender?.toLowerCase() === 'female'
            ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' // Placeholder/Example
            : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';
    };

    return (
        <Card className="p-4 h-full bg-white flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h3 className="font-bold text-lg text-gray-800">Today’s Birthday(s) And Anniversaries</h3>
                    <p className="text-sm text-gray-500">{format(new Date(), 'dd/MM/yyyy')}</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[300px] max-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : students.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                        <Cake className="w-10 h-10 opacity-20" />
                        <span>No birthdays today</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {students.map((student, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                                        <img
                                            src={student.photo || getGenderAvatar(student.gender)}
                                            alt={student.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = getGenderAvatar(student.gender);
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 text-sm line-clamp-1" title={student.name}>
                                            {student.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 line-clamp-1">
                                            {student.course}-{student.stream}
                                            {showBatch && student.batch ? `-${student.batch}` : ''}
                                            -{student.section}
                                        </p>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full whitespace-nowrap">
                                    Birthday
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
};
