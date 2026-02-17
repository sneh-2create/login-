import React from 'react';
import { Card } from '@od-erp/ui';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AttendanceCount } from '@od-erp/types';

interface AttendanceChartProps {
    data: AttendanceCount;
}

export const AttendanceChart: React.FC<AttendanceChartProps> = ({ data }) => {
    const chartData = [
        { name: 'Present', value: data.present || 0, color: '#4ade80' }, // green-400
        { name: 'Absent', value: data.absent || 0, color: '#f87171' },  // red-400
        { name: 'Leave', value: data.leave || 0, color: '#fbbf24' },   // amber-400
        { name: 'Holiday', value: data.holiday || 0, color: '#60a5fa' }, // blue-400
        { name: 'Weekly Off', value: data.weeklyOff || 0, color: '#9ca3af' }, // gray-400
        { name: 'Others', value: data.others || 0, color: '#a78bfa' }, // violet-400
    ].filter(item => item.value > 0);

    return (
        <Card className="h-full">
            <div className="p-6 h-full flex flex-col">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Yesterday's Attendance</h3>
                <div className="flex-1 min-h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    );
};
