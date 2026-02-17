import React from 'react';
import { Card } from '@od-erp/ui';
import { EmployeeBirthday } from '@od-erp/types';
import { User, Cake } from 'lucide-react';
import { format } from 'date-fns';

interface BirthdayListProps {
    employees: EmployeeBirthday[];
    currentDate?: Date;
}

export const BirthdayList: React.FC<BirthdayListProps> = ({ employees, currentDate = new Date() }) => {
    return (
        <Card className="p-4 h-full flex flex-col">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                    Current Month Birthday(s) And Anniversaries
                </h3>
                <span className="text-sm text-gray-500">{format(currentDate, 'dd/MM/yyyy')}</span>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                {employees.length > 0 ? (
                    <div className="space-y-3">
                        {employees.map((emp) => (
                            <div key={emp._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                                        {emp.photo ? (
                                            <img src={emp.photo} alt={emp.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="text-blue-500" size={20} />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 text-sm">{emp.name}</h4>
                                        <div className="text-xs text-gray-500">{emp.department}</div>
                                        <div className="text-xs text-gray-500">{emp.dob ? format(new Date(emp.dob), 'dd/MM/yyyy') : '-'}</div>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-pink-100 text-pink-600 text-xs font-semibold rounded-full flex items-center gap-1">
                                    <Cake size={12} />
                                    <span>Birthday</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <img src="/assets/images/dataNotFound.png" alt="No Data" className="h-32 opacity-50 mb-2" />
                        <span className="text-sm">No Data Found</span>
                    </div>
                )}
            </div>
        </Card>
    );
};
