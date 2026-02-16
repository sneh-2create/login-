import React, { useMemo } from 'react';
import { Card } from '@od-erp/ui';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { GroupData } from '@od-erp/types';

interface StudentDoughnutChartProps {
    data: GroupData[];
    title: string;
    loading?: boolean;
    dataKey: 'socialCategory' | 'religion';
}

const COLORS = [
    '#5065FE', '#FFDB00', '#03CEA4', '#FF3796', '#761137',
    '#1F8A70', '#62374E', '#3C2317', '#ECC5FB', '#21E6C1'
];

export const StudentDoughnutChart: React.FC<StudentDoughnutChartProps> = ({ data, title, loading, dataKey }) => {

    const chartData = useMemo(() => {
        return data.map((item, index) => ({
            name: item[dataKey] || 'Not Provided',
            value: item.count,
            color: COLORS[index % COLORS.length]
        }));
    }, [data, dataKey]);

    const totalCount = useMemo(() => {
        return data.reduce((acc, curr) => acc + curr.count, 0);
    }, [data]);

    return (
        <Card className="p-4 h-full bg-white flex flex-col">
            <h3 className="font-bold text-lg text-gray-800 mb-4">{title}</h3>

            <div className="flex-1 w-full min-h-[300px] relative flex flex-col sm:flex-row items-center justify-center">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        No data available
                    </div>
                ) : (
                    <>
                        <div className="w-full sm:w-1/2 h-[250px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                                        <tspan x="50%" dy="-0.5em" fontSize="24" fontWeight="bold" fill="#1F2937">{totalCount}</tspan>
                                        <tspan x="50%" dy="1.5em" fontSize="14" fill="#6B7280">Total</tspan>
                                    </text>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full sm:w-1/2 p-2">
                            <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                {chartData.map((entry, index) => (
                                    <div key={index} className="flex items-center space-x-2 text-sm p-1 hover:bg-gray-50 rounded">
                                        <div
                                            className="w-3 h-3 rounded-sm flex-shrink-0"
                                            style={{ backgroundColor: entry.color }}
                                        />
                                        <span className="font-medium text-gray-700 truncate flex-1" title={entry.name}>
                                            {entry.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Card>
    );
};
