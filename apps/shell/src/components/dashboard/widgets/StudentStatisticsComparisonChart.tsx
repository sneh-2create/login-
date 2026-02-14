import React, { useMemo } from 'react';
import { Card } from '@od-erp/ui';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { StudentSessionData } from '@od-erp/types';

interface StudentStatisticsComparisonChartProps {
    currentSessionData: StudentSessionData;
    previousSessionData: StudentSessionData;
    loading?: boolean;
}

export const StudentStatisticsComparisonChart: React.FC<StudentStatisticsComparisonChartProps> = ({
    currentSessionData,
    previousSessionData,
    loading
}) => {

    const chartData = useMemo(() => {
        return [
            {
                name: 'Total Students',
                current: currentSessionData.totalStudents || 0,
                previous: previousSessionData.totalStudents || 0
            },
            {
                name: 'Boys',
                current: currentSessionData.boys || 0,
                previous: previousSessionData.boys || 0
            },
            {
                name: 'Girls',
                current: currentSessionData.girls || 0,
                previous: previousSessionData.girls || 0
            },
            {
                name: 'Inactive Student',
                current: currentSessionData.inactiveStudents || 0,
                previous: previousSessionData.inactiveStudents || 0
            }
        ];
    }, [currentSessionData, previousSessionData]);

    return (
        <Card className="p-4 h-full bg-white flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800">Student Statistics Comparison With Previous Year</h3>
            </div>

            <div className="flex-1 w-full min-h-[400px] relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : (
                    <>
                        {/* Y-Axis Label positioned appropriately */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 -translate-x-[40%] origin-center text-sm font-bold text-gray-600 z-10">
                            No. Of Students
                        </div>

                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 30, // Increased left margin for Y Label
                                    bottom: 100, // Increased bottom margin further
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }} // Darker color
                                    interval={0} // Force show all labels
                                    dy={10} // Push labels down slightly to avoid overlap with bars
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend
                                    verticalAlign="top"
                                    align="right"
                                    iconType="rect"
                                    height={36}
                                />
                                <Bar
                                    dataKey="current"
                                    name="Current Session"
                                    fill="#FFDB00"
                                    radius={[4, 4, 0, 0]}
                                    barSize={50}
                                />
                                <Bar
                                    dataKey="previous"
                                    name="Previous Session"
                                    fill="#fddbab"
                                    stroke="#FFDB00"
                                    strokeWidth={1}
                                    radius={[4, 4, 0, 0]}
                                    barSize={50}
                                />
                            </BarChart>
                        </ResponsiveContainer>

                        <div className="absolute bottom-1 left-0 right-0 text-center text-sm font-bold text-gray-600">
                            Comparison Values
                        </div>
                    </>
                )}
            </div>
        </Card>
    );
};
