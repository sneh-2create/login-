import React from 'react';
import { Card } from '@od-erp/ui';
import { EmployeeDueTask } from '@od-erp/types';
import { ListTodo } from 'lucide-react';

interface TaskCardProps {
    data: EmployeeDueTask;
}

export const TaskCard: React.FC<TaskCardProps> = ({ data }) => {
    // Handle data being undefined/null gracefully
    const safeData = data || { overdue: 0, todayDue: 0, weekDue: 0 };
    const total = (safeData.overdue || 0) + (safeData.todayDue || 0) + (safeData.weekDue || 0);

    const calculatePercentage = (value: number) => {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    };

    return (
        <Card className="p-4 h-full border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h4 className="text-gray-800 text-lg font-bold flex items-center gap-2">
                    <ListTodo className="text-blue-500" size={20} />
                    Task
                </h4>
            </div>

            <div className="space-y-6 flex-1">
                {/* Overdue */}
                <div>
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-medium text-gray-600">Overdue Task</span>
                        <div className="text-right">
                            <span className="text-lg font-bold text-red-500 block leading-none">{safeData.overdue}</span>
                        </div>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-red-500 rounded-full transition-all duration-500"
                            style={{ width: `${calculatePercentage(safeData.overdue)}%` }}
                        />
                    </div>
                </div>

                {/* Today */}
                <div>
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-medium text-gray-600">Today Due Task</span>
                        <div className="text-right">
                            <span className="text-lg font-bold text-yellow-500 block leading-none">{safeData.todayDue}</span>
                        </div>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                            style={{ width: `${calculatePercentage(safeData.todayDue)}%` }}
                        />
                    </div>
                </div>

                {/* Week */}
                <div>
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-medium text-gray-600">This Week Due Task</span>
                        <div className="text-right">
                            <span className="text-lg font-bold text-green-500 block leading-none">{safeData.weekDue}</span>
                        </div>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 rounded-full transition-all duration-500"
                            style={{ width: `${calculatePercentage(safeData.weekDue)}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                <span className="text-sm text-gray-500">Total Due Tasks: <span className="font-bold text-gray-800">{total}</span></span>
            </div>
        </Card>
    );
};
