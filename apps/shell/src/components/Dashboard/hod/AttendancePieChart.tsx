// @ts-nocheck
import React from 'react';
import { Card } from '@od-erp/ui';
import { EmployeeAttendanceStatusCount } from '@od-erp/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface AttendancePieChartProps {
    data: EmployeeAttendanceStatusCount[];
}

export const AttendancePieChart: React.FC<AttendancePieChartProps> = ({ data }) => {
    // Define colors for specific status (can be extended)
    const getColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'present': return '#35C87C'; // Green
            case 'absent': return '#FE6C8A'; // Red
            case 'leave': return '#FCB965'; // Orange
            case 'half day': return '#41A6ED'; // Blue
            case 'holiday': return '#761137'; // Dark Red
            default: return '#6c757d'; // Gray
        }
    };

    const total = data.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <Card className="p-4 h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
                Yesterday's Attendance
            </h3>
            {total > 0 ? (
                <div className="flex-1 relative w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="count"
                                nameKey="attendanceValue"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getColor(entry.attendanceValue)} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: any) => [value, 'Employees']}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend
                                layout="vertical"
                                align="right"
                                verticalAlign="middle"
                                iconType="circle"
                                wrapperStyle={{ fontSize: '12px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -translate-x-[20%]"> {/* Shift needed due to right legend */}
                        <div className="flex flex-col items-center">
                            <span className="text-sm text-gray-500">Total</span>
                            <span className="text-xl font-bold text-gray-800">{total}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <img src="/assets/images/dataNotFound.png" alt="No Data" className="h-32 opacity-50 mb-2" />
                    <span className="text-sm">No Data Found</span>
                </div>
            )}
        </Card>
    );
};
